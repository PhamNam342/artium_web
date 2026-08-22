import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ILike, In, Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import {
  Artwork,
  ArtworkDimensions,
  ArtworkImage,
  ArtworkStatus,
} from './artwork.entity';
import { ArtworkWeightInput, CreateArtworkDto } from './dto/create-artwork.dto';
import {
  ArtworkDimensionsResponseDto,
  ArtworkImageResponseDto,
  ArtworkResponseDto,
  ArtworkTagResponseDto,
  DeleteArtworkResponseDto,
  ListArtworksResponseDto,
} from './dto/artwork-response.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { CreateArtworkTagDto } from './dto/create-artwork-tag.dto';
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
  customTags: string[];
  materials: string | null;
  dimensions: ArtworkDimensions | null;
  weight: string | null;
};

type NormalizedUpdateArtworkInput = Partial<NormalizedCreateArtworkInput>;

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

  async create(
    input: CreateArtworkDto,
    sellerIdOverride: string,
  ): Promise<ArtworkResponseDto> {
    const normalizedInput = this.normalizeCreateInput(input, sellerIdOverride);
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
      customTags: normalizedInput.customTags,
      viewCount: 0,
      materials: normalizedInput.materials,
      dimensions: normalizedInput.dimensions,
      weight: normalizedInput.weight,
      tags,
    });

    return this.toArtworkResponse(await this.artworkRepository.save(artwork));
  }

  async findTags(): Promise<ArtworkTagResponseDto[]> {
    const tags = await this.tagRepository.find({
      order: { name: 'ASC' },
    });

    return this.toTagResponses(tags);
  }

  async createTag(input: CreateArtworkTagDto): Promise<ArtworkTagResponseDto> {
    const name = this.cleanRequiredString(input.name, 'name');
    this.assertMaxLength(name, 'name', 40);

    const existingTag = await this.tagRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existingTag) {
      return this.toTagResponse(existingTag);
    }

    const tag = this.tagRepository.create({ name });
    return this.toTagResponse(await this.tagRepository.save(tag));
  }

  async findAll(query: ListArtworksQueryDto): Promise<ListArtworksResponseDto> {
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
      .orderBy('artwork.createdAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return this.toResponseDto(ListArtworksResponseDto, {
      data: data.map((artwork) => this.toArtworkResponse(artwork)),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasNextPage: filters.page * filters.limit < total,
        hasPreviousPage: filters.page > 1,
      },
    });
  }

  async findMine(
    sellerId: string,
    query: ListArtworksQueryDto,
  ): Promise<ListArtworksResponseDto> {
    const normalizedSellerId = this.cleanRequiredUuid(sellerId, 'sellerId');
    const filters = this.normalizeQuery(query);

    const queryBuilder = this.artworkRepository
      .createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.tags', 'tag')
      .where('artwork.seller_id = :sellerId', { sellerId: normalizedSellerId });

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
      .orderBy('artwork.createdAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return this.toResponseDto(ListArtworksResponseDto, {
      data: data.map((artwork) => this.toArtworkResponse(artwork)),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasNextPage: filters.page * filters.limit < total,
        hasPreviousPage: filters.page > 1,
      },
    });
  }

  async findOne(id: string): Promise<ArtworkResponseDto> {
    const artworkId = this.cleanRequiredUuid(id, 'id');
    const artwork = await this.artworkRepository.findOne({
      where: { id: artworkId },
      relations: { tags: true },
    });

    if (!artwork) {
      throw new NotFoundException(t('artwork.not_found'));
    }

    return this.toArtworkResponse(artwork);
  }

  async update(
    id: string,
    input: UpdateArtworkDto,
    ownerId: string,
  ): Promise<ArtworkResponseDto> {
    const artworkId = this.cleanRequiredUuid(id, 'id');
    const normalizedOwnerId = this.cleanRequiredUuid(ownerId, 'sellerId');
    const normalizedInput = this.normalizeUpdateInput(input);
    const { tagIds, ...artworkPatch } = normalizedInput;

    if (Object.keys(artworkPatch).length === 0 && tagIds === undefined) {
      throw new BadRequestException(t('artwork.update_fields_required'));
    }

    const artwork = await this.artworkRepository.findOne({
      where: { id: artworkId, sellerId: normalizedOwnerId },
      relations: { tags: true },
    });

    if (!artwork) {
      throw new NotFoundException(t('artwork.not_found'));
    }

    Object.assign(artwork, artworkPatch);

    if (tagIds !== undefined) {
      artwork.tags = await this.findTagsByIds(tagIds);
    }

    return this.toArtworkResponse(await this.artworkRepository.save(artwork));
  }

  async remove(id: string, ownerId: string): Promise<DeleteArtworkResponseDto> {
    const artworkId = this.cleanRequiredUuid(id, 'id');
    const normalizedOwnerId = this.cleanRequiredUuid(ownerId, 'sellerId');
    const result = await this.artworkRepository.delete({
      id: artworkId,
      sellerId: normalizedOwnerId,
    });

    if (!result.affected) {
      throw new NotFoundException(t('artwork.not_found'));
    }

    return this.toResponseDto(DeleteArtworkResponseDto, { success: true });
  }

  async updateStatus(
    id: string,
    status: ArtworkStatus | string,
    ownerId: string,
  ): Promise<ArtworkResponseDto> {
    return this.update(id, { status }, ownerId);
  }

  async updatePublish(
    id: string,
    isPublished: boolean,
    ownerId: string,
  ): Promise<ArtworkResponseDto> {
    return this.update(id, { isPublished }, ownerId);
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
      throw new BadRequestException(t('artwork.min_price_less_than_max_price'));
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
      throw new BadRequestException(
        t('artwork.validation.positive_integer', {
          args: { field: fieldName },
        }),
      );
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
      throw new BadRequestException(
        t('artwork.validation.non_negative_number', {
          args: { field: fieldName },
        }),
      );
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
    sellerIdOverride?: string,
  ): NormalizedCreateArtworkInput {
    const sellerId = this.cleanRequiredUuid(
      sellerIdOverride ?? input.sellerId,
      'sellerId',
    );
    const title = this.cleanRequiredString(input.title, 'title');
    const folderId = this.cleanOptionalUuid(input.folderId, 'folderId');
    const tagIds = this.normalizeTagIds(input.tagIds);
    const customTags = this.normalizeCustomTags(input.customTags);
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
      customTags,
      materials,
      dimensions: this.normalizeDimensions(input.dimensions),
      weight: this.normalizeWeight(input.weight),
    };
  }

  private normalizeUpdateInput(
    input: UpdateArtworkDto,
  ): NormalizedUpdateArtworkInput {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException(
        t('artwork.validation.required', { args: { field: 'update' } }),
      );
    }

    const normalizedInput: NormalizedUpdateArtworkInput = {};

    if (this.hasOwn(input, 'title')) {
      const title = this.cleanRequiredString(input.title, 'title');
      this.assertMaxLength(title, 'title', 100);
      normalizedInput.title = title;
    }

    if (this.hasOwn(input, 'description')) {
      normalizedInput.description = this.cleanNullableString(input.description);
    }

    if (this.hasOwn(input, 'price')) {
      normalizedInput.price = this.parseOptionalDecimal(input.price, 'price');
    }

    if (this.hasOwn(input, 'currency')) {
      const currency = this.normalizeCurrency(input.currency);
      this.assertMaxLength(currency, 'currency', 10);
      normalizedInput.currency = currency;
    }

    if (this.hasOwn(input, 'status')) {
      normalizedInput.status = this.normalizeArtworkStatus(input.status);
    }

    if (this.hasOwn(input, 'isPublished')) {
      normalizedInput.isPublished = this.normalizeBoolean(
        input.isPublished,
        'isPublished',
      );
    }

    if (this.hasOwn(input, 'images')) {
      normalizedInput.images = this.normalizeImages(input.images);
    }

    if (this.hasOwn(input, 'folderId')) {
      normalizedInput.folderId = this.cleanOptionalUuid(
        input.folderId,
        'folderId',
      );
    }

    if (this.hasOwn(input, 'tagIds')) {
      normalizedInput.tagIds = this.normalizeTagIds(input.tagIds);
    }

    if (this.hasOwn(input, 'customTags')) {
      normalizedInput.customTags = this.normalizeCustomTags(input.customTags);
    }

    if (this.hasOwn(input, 'materials') || this.hasOwn(input, 'material')) {
      const materials = this.cleanNullableString(
        this.hasOwn(input, 'materials') ? input.materials : input.material,
      );
      this.assertMaxLength(materials, 'materials', 80);
      normalizedInput.materials = materials;
    }

    if (this.hasOwn(input, 'dimensions')) {
      normalizedInput.dimensions = this.normalizeDimensions(input.dimensions);
    }

    if (this.hasOwn(input, 'weight')) {
      normalizedInput.weight = this.normalizeWeight(input.weight);
    }

    return normalizedInput;
  }

  private cleanRequiredString(value: unknown, fieldName: string) {
    const cleanedValue = this.cleanString(value);

    if (!cleanedValue) {
      throw new BadRequestException(
        t('artwork.validation.required', { args: { field: fieldName } }),
      );
    }

    return cleanedValue;
  }

  private cleanRequiredUuid(value: unknown, fieldName: string) {
    const cleanedValue = this.cleanRequiredString(value, fieldName);

    if (!this.isUuid(cleanedValue)) {
      throw new BadRequestException(
        t('artwork.validation.uuid', { args: { field: fieldName } }),
      );
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
      throw new BadRequestException(
        t('artwork.validation.uuid', { args: { field: fieldName } }),
      );
    }

    return cleanedValue;
  }

  private normalizeCurrency(value: unknown) {
    const currency = this.cleanString(value);
    return currency ? currency.toUpperCase() : null;
  }

  private normalizeArtworkStatus(value: ArtworkStatus | string | undefined) {
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
      throw new BadRequestException(t('artwork.validation.valid_status'));
    }

    return normalizedStatus as ArtworkStatus;
  }

  private normalizeBoolean(value: boolean | undefined, fieldName: string) {
    if (value === undefined) {
      return false;
    }

    if (typeof value !== 'boolean') {
      throw new BadRequestException(
        t('artwork.validation.boolean', { args: { field: fieldName } }),
      );
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
      throw new BadRequestException(
        t('artwork.validation.non_negative_number', {
          args: { field: fieldName },
        }),
      );
    }

    return parsedValue.toFixed(2);
  }

  private normalizeImages(images: Array<Partial<ArtworkImage>> | undefined) {
    if (images === undefined) {
      return [];
    }

    if (!Array.isArray(images)) {
      throw new BadRequestException(
        t('artwork.validation.array', { args: { field: 'images' } }),
      );
    }

    return images.map((image, index) => {
      if (typeof image !== 'object' || image === null || Array.isArray(image)) {
        throw new BadRequestException(
          t('artwork.validation.object', {
            args: { field: `images.${index}` },
          }),
        );
      }

      const url =
        this.cleanString(image.url) ?? this.cleanString(image.secureUrl);

      if (!url) {
        throw new BadRequestException(
          t('artwork.validation.image_url_required', {
            args: { field: `images.${index}.url` },
          }),
        );
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
      throw new BadRequestException(
        t('artwork.validation.object', { args: { field: 'dimensions' } }),
      );
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
      throw new BadRequestException(
        t('artwork.validation.number', {
          args: { field: `dimensions.${fieldName}` },
        }),
      );
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
        throw new BadRequestException(t('artwork.validation.weight_format'));
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
      throw new BadRequestException(
        t('artwork.validation.array', { args: { field: 'tagIds' } }),
      );
    }

    const normalizedTagIds = tagIds.map((tagId, index) => {
      const cleanedTagId = this.cleanRequiredString(tagId, `tagIds.${index}`);

      if (!this.isUuid(cleanedTagId)) {
        throw new BadRequestException(
          t('artwork.validation.uuid', {
            args: { field: `tagIds.${index}` },
          }),
        );
      }

      return cleanedTagId;
    });

    return Array.from(new Set(normalizedTagIds));
  }

  private normalizeCustomTags(customTags: string[] | undefined) {
    if (customTags === undefined) {
      return [];
    }

    if (!Array.isArray(customTags)) {
      throw new BadRequestException(
        t('artwork.validation.array', { args: { field: 'customTags' } }),
      );
    }

    if (customTags.length > 10) {
      throw new BadRequestException(
        t('artwork.validation.max_length', {
          args: { field: 'customTags', maxLength: 10 },
        }),
      );
    }

    const normalizedTags = customTags.map((tag, index) => {
      const cleanedTag = this.cleanRequiredString(tag, `customTags.${index}`);
      this.assertMaxLength(cleanedTag, `customTags.${index}`, 40);
      return cleanedTag;
    });

    return Array.from(
      new Map(normalizedTags.map((tag) => [tag.toLocaleLowerCase(), tag])).values(),
    );
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
        t('artwork.validation.tag_ids_not_found', {
          args: { tagIds: missingTagIds.join(', ') },
        }),
      );
    }

    return tags;
  }

  private toArtworkResponse(artwork: Artwork): ArtworkResponseDto {
    return this.toResponseDto(ArtworkResponseDto, {
      id: artwork.id,
      sellerId: artwork.sellerId,
      title: artwork.title,
      description: artwork.description ?? null,
      price: artwork.price ?? null,
      currency: artwork.currency ?? null,
      status: artwork.status,
      isPublished: artwork.isPublished,
      images: this.toImageResponses(artwork.images),
      folderId: artwork.folderId ?? null,
      viewCount: artwork.viewCount ?? 0,
      tags: this.toTagResponses(artwork.tags),
      customTags: artwork.customTags ?? [],
      createdAt: this.toIsoDateString(artwork.createdAt),
      materials: artwork.materials ?? null,
      dimensions: this.toDimensionsResponse(artwork.dimensions),
      weight: artwork.weight ?? null,
    });
  }

  private toImageResponses(
    images: ArtworkImage[] | undefined,
  ): ArtworkImageResponseDto[] {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.map((image) =>
      this.stripUndefined({
        publicId: image.publicId,
        url: image.url,
        secureUrl: image.secureUrl,
        format: image.format,
        width: image.width,
        height: image.height,
        size: image.size,
        bucket: image.bucket,
        alt: image.alt,
        altText: image.altText,
        order: image.order,
        isPrimary: image.isPrimary,
      }),
    );
  }

  private toDimensionsResponse(
    dimensions: ArtworkDimensions | null | undefined,
  ): ArtworkDimensionsResponseDto | null {
    if (!dimensions) {
      return null;
    }

    return this.stripUndefined({
      height: dimensions.height,
      width: dimensions.width,
      depth: dimensions.depth,
      unit: dimensions.unit,
    });
  }

  private toTagResponses(tags: Tag[] | undefined): ArtworkTagResponseDto[] {
    return (tags ?? []).map((tag) => this.toTagResponse(tag));
  }

  private toTagResponse(tag: Tag): ArtworkTagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
    };
  }

  private toIsoDateString(value: Date | string | undefined) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return typeof value === 'string' ? value : null;
  }

  private toResponseDto<T extends object>(
    dto: ClassConstructor<T>,
    value: Record<string, unknown>,
  ) {
    return plainToInstance(dto, value, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  private stripUndefined<T extends Record<string, unknown>>(value: T) {
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, fieldValue]) => fieldValue !== undefined,
      ),
    ) as T;
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
        t('artwork.validation.max_length', {
          args: { field: fieldName, maxLength },
        }),
      );
    }
  }

  private hasOwn(value: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(value, key) as boolean;
  }
}
