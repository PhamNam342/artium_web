import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from './artwork.entity';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';

type NormalizedListArtworksQuery = {
  page: number;
  limit: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  material?: string;
};

@Injectable()
export class ArtworksService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 12;
  private readonly maxLimit = 100;

  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

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

  private cleanString(value: string | undefined) {
    const cleanedValue = value?.trim();
    return cleanedValue === '' ? undefined : cleanedValue;
  }
}
