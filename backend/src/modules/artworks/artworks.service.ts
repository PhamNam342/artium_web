import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Artwork,
  ArtworkDimensions,
  ArtworkImage,
  ArtworkStatus,
} from './artwork.entity';
import { ArtworkWeightInput, CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { Tag } from './tag.entity';

type NormalizedListArtworksQuery = {
  page: number;
  limit: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  material?: string;
};

type NormalizedCreateArtworkInput = {
  sellerId: string;
  title: string;
  description: string | null;
  price: string | null;
  currency: string | null;
  status: ArtworkStatus;
  isPublished: boolean;
  images: ArtworkImage[];
  folderId: string | null;
  tagIds: string[];
  materials: string | null;
  dimensions: ArtworkDimensions | null;
  weight: string | null;
};

@Injectable()
export class ArtworksService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 12;
  private readonly maxLimit = 100;

  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(input: CreateArtworkDto) {
    const normalizedInput = this.normalizeCreateInput(input);
    const tags = await this.findTagsByIds(normalizedInput.tagIds);

    const artwork = this.artworkRepository.create({
      sellerId: normalizedInput.sellerId,
      title: normalizedInput.title,
      description: normalizedInput.description,
      price: normalizedInput.price,
      currency: normalizedInput.currency,
      status: normalizedInput.status,
      isPublished: normalizedInput.isPublished,
      images: normalizedInput.images,
      folderId: normalizedInput.folderId,
      viewCount: 0,
      materials: normalizedInput.materials,
      dimensions: normalizedInput.dimensions,
      weight: normalizedInput.weight,
      tags,
    });

    return this.artworkRepository.save(artwork);
  }

  async findAll(query: ListArtworksQueryDto) {
    const filters = this.normalizeQuery(query);

    const queryBuilder = this.artworkRepository
      .createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.tags', 'tag')
      .where('artwork.is_published = :isPublished', { isPublished: true })
      .andWhere('artwork.status = :status', {
        status: ArtworkStatus.ACTIVE,
      });

    if (filters.search) {
      queryBuilder.andWhere(
        '(artwork.title ILIKE :search OR artwork.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('artwork.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('artwork.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.category) {
      queryBuilder.andWhere('LOWER(tag.name) = LOWER(:category)', {
        category: filters.category,
      });
    }

    if (filters.material) {
      queryBuilder.andWhere('artwork.materials ILIKE :material', {
        material: `%${filters.material}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('artwork.created_at', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasNextPage: filters.page * filters.limit < total,
        hasPreviousPage: filters.page > 1,
      },
    };
  }

  private normalizeQuery(
    query: ListArtworksQueryDto,
  ): NormalizedListArtworksQuery {
    const page = this.parsePositiveInteger(
      query.page,
      'page',
      this.defaultPage,
    );
    const limit = Math.min(
      this.parsePositiveInteger(query.limit, 'limit', this.defaultLimit),
      this.maxLimit,
    );
    const minPrice = this.parseOptionalPositiveNumber(
      query.minPrice,
      'minPrice',
    );
    const maxPrice = this.parseOptionalPositiveNumber(
      query.maxPrice,
      'maxPrice',
    );

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException('minPrice must be less than maxPrice');
    }

    return {
      page,
      limit,
      search: this.cleanString(query.search),
      minPrice,
      maxPrice,
      category: this.cleanString(query.category),
      material: this.cleanString(query.material),
    };
  }

  private parsePositiveInteger(
    value: string | undefined,
    fieldName: string,
    fallback: number,
  ) {
    if (value === undefined || value.trim() === '') {
      return fallback;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }

    return parsedValue;
  }

  private parseOptionalPositiveNumber(
    value: string | undefined,
    fieldName: string,
  ) {
    if (value === undefined || value.trim() === '') {
      return undefined;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new BadRequestException(`${fieldName} must be a positive number`);
    }

    return parsedValue;
  }

  private cleanString(value: unknown) {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string') {
      return undefined;
    }

    const cleanedValue = value.trim();
    return cleanedValue === '' ? undefined : cleanedValue;
  }

  private normalizeCreateInput(
    input: CreateArtworkDto,
  ): NormalizedCreateArtworkInput {
    const sellerId = this.cleanRequiredUuid(input.sellerId, 'sellerId');
    const title = this.cleanRequiredString(input.title, 'title');
    const folderId = this.cleanOptionalUuid(input.folderId, 'folderId');
    const tagIds = this.normalizeTagIds(input.tagIds);
    const currency = this.normalizeCurrency(input.currency);
    const materials = this.cleanNullableString(
      input.materials ?? input.material,
    );

    this.assertMaxLength(title, 'title', 100);
    this.assertMaxLength(currency, 'currency', 10);
    this.assertMaxLength(materials, 'materials', 80);

    return {
      sellerId,
      title,
      description: this.cleanNullableString(input.description),
      price: this.parseOptionalDecimal(input.price, 'price'),
      currency,
      status: this.normalizeArtworkStatus(input.status),
      isPublished: this.normalizeBoolean(input.isPublished, 'isPublished'),
      images: this.normalizeImages(input.images),
      folderId,
      tagIds,
      materials,
      dimensions: this.normalizeDimensions(input.dimensions),
      weight: this.normalizeWeight(input.weight),
    };
  }

  private cleanRequiredString(value: unknown, fieldName: string) {
    const cleanedValue = this.cleanString(value);

    if (!cleanedValue) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return cleanedValue;
  }

  private cleanRequiredUuid(value: unknown, fieldName: string) {
    const cleanedValue = this.cleanRequiredString(value, fieldName);

    if (!this.isUuid(cleanedValue)) {
      throw new BadRequestException(`${fieldName} must be a valid UUID`);
    }

    return cleanedValue;
  }

  private cleanNullableString(value: unknown) {
    return this.cleanString(value) ?? null;
  }

  private cleanOptionalUuid(value: unknown, fieldName: string) {
    const cleanedValue = this.cleanString(value);

    if (!cleanedValue) {
      return null;
    }

    if (!this.isUuid(cleanedValue)) {
      throw new BadRequestException(`${fieldName} must be a valid UUID`);
    }

    return cleanedValue;
  }

  private normalizeCurrency(value: unknown) {
    const currency = this.cleanString(value);
    return currency ? currency.toUpperCase() : null;
  }

  private normalizeArtworkStatus(value: ArtworkStatus | undefined) {
    if (value === undefined) {
      return ArtworkStatus.DRAFT;
    }

    const normalizedStatus = String(value).trim().toUpperCase();
    const statusAliases: Record<string, ArtworkStatus> = {
      AVAILABLE: ArtworkStatus.ACTIVE,
      ACTIVE: ArtworkStatus.ACTIVE,
      SOLD: ArtworkStatus.SOLD,
      RESERVED: ArtworkStatus.RESERVED,
      DRAFT: ArtworkStatus.DRAFT,
      INACTIVE: ArtworkStatus.INACTIVE,
      DELETED: ArtworkStatus.DELETED,
      PENDING_REVIEW: ArtworkStatus.PENDING_REVIEW,
    };

    if (statusAliases[normalizedStatus]) {
      return statusAliases[normalizedStatus];
    }

    const allowedStatuses = Object.values(ArtworkStatus);

    if (!allowedStatuses.includes(normalizedStatus as ArtworkStatus)) {
      throw new BadRequestException('status must be a valid artwork status');
    }

    return normalizedStatus as ArtworkStatus;
  }

  private normalizeBoolean(value: boolean | undefined, fieldName: string) {
    if (value === undefined) {
      return false;
    }

    if (typeof value !== 'boolean') {
      throw new BadRequestException(`${fieldName} must be a boolean`);
    }

    return value;
  }

  private parseOptionalDecimal(
    value: string | number | null | undefined,
    fieldName: string,
  ) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new BadRequestException(`${fieldName} must be a positive number`);
    }

    return parsedValue.toFixed(2);
  }

  private normalizeImages(images: ArtworkImage[] | undefined) {
    if (images === undefined) {
      return [];
    }

    if (!Array.isArray(images)) {
      throw new BadRequestException('images must be an array');
    }

    return images.map((image, index) => {
      if (typeof image !== 'object' || image === null || Array.isArray(image)) {
        throw new BadRequestException(`images.${index} must be an object`);
      }

      const url =
        this.cleanString(image.url) ?? this.cleanString(image.secureUrl);

      if (!url) {
        throw new BadRequestException(`images.${index}.url is required`);
      }

      return {
        ...image,
        url,
        secureUrl: this.cleanString(image.secureUrl),
        alt: this.cleanString(image.alt ?? image.altText),
        altText: this.cleanString(image.altText ?? image.alt),
      };
    });
  }

  private normalizeDimensions(
    dimensions: ArtworkDimensions | null | undefined,
  ) {
    if (dimensions === undefined || dimensions === null) {
      return null;
    }

    if (typeof dimensions !== 'object' || Array.isArray(dimensions)) {
      throw new BadRequestException('dimensions must be an object');
    }

    return {
      height: this.parseOptionalDimensionValue(dimensions.height, 'height'),
      width: this.parseOptionalDimensionValue(dimensions.width, 'width'),
      depth: this.parseOptionalDimensionValue(dimensions.depth, 'depth'),
      unit: this.cleanString(dimensions.unit) ?? 'cm',
    };
  }

  private parseOptionalDimensionValue(
    value: number | string | null | undefined,
    fieldName: string,
  ) {
    if (value === undefined || value === null) {
      return undefined;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new BadRequestException(`dimensions.${fieldName} must be a number`);
    }

    return parsedValue;
  }

  private normalizeWeight(
    weight: string | number | ArtworkWeightInput | null | undefined,
  ) {
    if (weight === undefined || weight === null || weight === '') {
      return null;
    }

    if (typeof weight === 'object') {
      if (Array.isArray(weight)) {
        throw new BadRequestException('weight must be a number or an object');
      }

      return this.parseOptionalDecimal(weight.value, 'weight');
    }

    return this.parseOptionalDecimal(weight, 'weight');
  }

  private normalizeTagIds(tagIds: string[] | undefined) {
    if (tagIds === undefined) {
      return [];
    }

    if (!Array.isArray(tagIds)) {
      throw new BadRequestException('tagIds must be an array');
    }

    const normalizedTagIds = tagIds.map((tagId, index) => {
      const cleanedTagId = this.cleanRequiredString(tagId, `tagIds.${index}`);

      if (!this.isUuid(cleanedTagId)) {
        throw new BadRequestException(`tagIds.${index} must be a valid UUID`);
      }

      return cleanedTagId;
    });

    return Array.from(new Set(normalizedTagIds));
  }

  private async findTagsByIds(tagIds: string[]) {
    if (tagIds.length === 0) {
      return [];
    }

    const tags = await this.tagRepository.find({ where: { id: In(tagIds) } });
    const foundTagIds = new Set(tags.map((tag) => tag.id));
    const missingTagIds = tagIds.filter((tagId) => !foundTagIds.has(tagId));

    if (missingTagIds.length > 0) {
      throw new BadRequestException(
        `tagIds not found: ${missingTagIds.join(', ')}`,
      );
    }

    return tags;
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private assertMaxLength(
    value: string | null,
    fieldName: string,
    maxLength: number,
  ) {
    if (value !== null && value.length > maxLength) {
      throw new BadRequestException(
        `${fieldName} must be at most ${maxLength} characters`,
      );
    }
  }
}
