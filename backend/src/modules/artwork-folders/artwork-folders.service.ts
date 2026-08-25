import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { Artwork } from '../artworks/artwork.entity';
import { ArtworkResponseDto } from '../artworks/dto/artwork-response.dto';
import { ArtworkFolder } from './artwork-folder.entity';
import { CreateArtworkFolderDto } from './dto/create-artwork-folder.dto';
import { ListFolderArtworksQueryDto } from './dto/list-folder-artworks-query.dto';
import { MoveArtworkFolderDto } from './dto/move-artwork-folder.dto';
import {
  ArtworkFolderResponseDto,
  ArtworkFolderTreeResponseDto,
  ListFolderArtworksResponseDto,
} from './dto/artwork-folder-response.dto';
import { UpdateArtworkFolderDto } from './dto/update-artwork-folder.dto';

@Injectable()
export class ArtworkFoldersService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;

  constructor(
    @InjectRepository(ArtworkFolder)
    private readonly folderRepository: Repository<ArtworkFolder>,
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

  async create(
    sellerId: string,
    input: CreateArtworkFolderDto,
  ): Promise<ArtworkFolderResponseDto> {
    const normalizedSellerId = this.requireUuid(sellerId, 'sellerId');
    const name = this.requireName(input.name);
    const parentId = this.optionalUuid(input.parentId, 'parentId');

    if (parentId) {
      await this.getOwnedFolder(parentId, normalizedSellerId);
    }

    const folder = this.folderRepository.create({
      sellerId: normalizedSellerId,
      name,
      parentId,
    });
    return this.toFolderResponse(await this.folderRepository.save(folder));
  }

  async findTree(sellerId: string): Promise<ArtworkFolderTreeResponseDto[]> {
    const normalizedSellerId = this.requireUuid(sellerId, 'sellerId');
    const folders = await this.folderRepository.find({
      where: { sellerId: normalizedSellerId },
      order: { createdAt: 'ASC' },
    });
    const counts = await this.getArtworkCounts(normalizedSellerId);
    const nodes = new Map<string, ArtworkFolderTreeResponseDto>();

    for (const folder of folders) {
      nodes.set(folder.id, {
        ...this.toFolderResponse(folder, counts.get(folder.id) ?? 0),
        children: [],
      });
    }

    const roots: ArtworkFolderTreeResponseDto[] = [];
    for (const folder of folders) {
      const node = nodes.get(folder.id)!;
      const parent = folder.parentId ? nodes.get(folder.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    return roots;
  }

  async findOne(
    folderId: string,
    ownerId: string,
  ): Promise<ArtworkFolderResponseDto> {
    const folder = await this.getOwnedFolder(folderId, ownerId);
    const artworkCount = await this.artworkRepository.count({
      where: { folderId: folder.id },
    });
    return this.toFolderResponse(folder, artworkCount);
  }

  async update(
    folderId: string,
    ownerId: string,
    input: UpdateArtworkFolderDto,
  ): Promise<ArtworkFolderResponseDto> {
    if (input.name === undefined && input.isVisible === undefined) {
      throw new BadRequestException(t('artwork_folder.update_fields_required'));
    }
    const folder = await this.getOwnedFolder(folderId, ownerId);
    if (input.name !== undefined) folder.name = this.requireName(input.name);
    if (input.isVisible !== undefined) folder.isVisible = input.isVisible;
    const savedFolder = await this.folderRepository.save(folder);
    const artworkCount = await this.artworkRepository.count({
      where: { folderId: savedFolder.id },
    });
    return this.toFolderResponse(savedFolder, artworkCount);
  }

  async listArtworks(
    folderId: string,
    ownerId: string,
    query: ListFolderArtworksQueryDto,
  ): Promise<ListFolderArtworksResponseDto> {
    const folder = await this.getOwnedFolder(folderId, ownerId);
    const page = this.positiveInteger(query.page, 'page', this.defaultPage);
    const limit = Math.min(
      this.positiveInteger(query.limit, 'limit', this.defaultLimit),
      this.maxLimit,
    );
    const [artworks, total] = await this.artworkRepository.findAndCount({
      where: { folderId: folder.id, sellerId: folder.sellerId },
      relations: { tags: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return plainToInstance(
      ListFolderArtworksResponseDto,
      {
        data: artworks.map((artwork) => this.toArtworkResponse(artwork)),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      },
      { excludeExtraneousValues: true },
    );
  }

  async move(
    folderId: string,
    ownerId: string,
    input: MoveArtworkFolderDto,
  ): Promise<ArtworkFolderResponseDto> {
    if (!Object.prototype.hasOwnProperty.call(input, 'parentId')) {
      throw new BadRequestException(t('artwork_folder.parent_id_required'));
    }
    const folder = await this.getOwnedFolder(folderId, ownerId);
    const parentId = this.optionalUuid(input.parentId, 'parentId');
    if (parentId === folder.id) {
      throw new BadRequestException(t('artwork_folder.cannot_be_own_parent'));
    }
    if (parentId) {
      await this.getOwnedFolder(parentId, folder.sellerId);
      await this.assertNotDescendant(parentId, folder.id, folder.sellerId);
    }
    folder.parentId = parentId;
    const savedFolder = await this.folderRepository.save(folder);
    const artworkCount = await this.artworkRepository.count({
      where: { folderId: savedFolder.id },
    });
    return this.toFolderResponse(savedFolder, artworkCount);
  }

  async remove(folderId: string, ownerId: string): Promise<{ success: true }> {
    const folder = await this.getOwnedFolder(folderId, ownerId);
    const childCount = await this.folderRepository.count({
      where: { parentId: folder.id, sellerId: folder.sellerId },
    });
    if (childCount > 0) {
      throw new BadRequestException(t('artwork_folder.children_must_be_moved'));
    }

    await this.artworkRepository.manager.transaction(async (manager) => {
      await manager.update(
        Artwork,
        { folderId: folder.id },
        { folderId: null },
      );
      await manager.delete(ArtworkFolder, {
        id: folder.id,
        sellerId: folder.sellerId,
      });
    });
    return { success: true };
  }

  private async getOwnedFolder(folderId: string, ownerId: string) {
    const id = this.requireUuid(folderId, 'folderId');
    const sellerId = this.requireUuid(ownerId, 'sellerId');
    const folder = await this.folderRepository.findOne({
      where: { id, sellerId },
    });
    if (!folder) throw new NotFoundException(t('artwork_folder.not_found'));
    return folder;
  }

  private async assertNotDescendant(
    prospectiveParentId: string,
    folderId: string,
    sellerId: string,
  ) {
    let currentId: string | null = prospectiveParentId;
    while (currentId) {
      if (currentId === folderId) {
        throw new BadRequestException(
          t('artwork_folder.cannot_move_to_descendant'),
        );
      }
      const current = await this.folderRepository.findOne({
        where: { id: currentId, sellerId },
        select: { id: true, parentId: true },
      });
      currentId = current?.parentId ?? null;
    }
  }

  private async getArtworkCounts(sellerId: string) {
    const rows = await this.artworkRepository
      .createQueryBuilder('artwork')
      .select('artwork.folder_id', 'folderId')
      .addSelect('COUNT(*)', 'count')
      .where('artwork.seller_id = :sellerId', { sellerId })
      .andWhere('artwork.folder_id IS NOT NULL')
      .groupBy('artwork.folder_id')
      .getRawMany<{ folderId: string; count: string }>();
    return new Map(rows.map((row) => [row.folderId, Number(row.count)]));
  }

  private toFolderResponse(folder: ArtworkFolder, artworkCount = 0) {
    return plainToInstance(
      ArtworkFolderResponseDto,
      {
        ...folder,
        artworkCount,
        createdAt: folder.createdAt.toISOString(),
        updatedAt: folder.updatedAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  private toArtworkResponse(artwork: Artwork) {
    return plainToInstance(ArtworkResponseDto, artwork, {
      excludeExtraneousValues: true,
    });
  }

  private requireName(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(
        t('artwork_folder.validation.required', { args: { field: 'name' } }),
      );
    }
    const name = value.trim();
    if (name.length > 100) {
      throw new BadRequestException(
        t('artwork_folder.validation.max_length', {
          args: { field: 'name', maxLength: 100 },
        }),
      );
    }
    return name;
  }

  private optionalUuid(value: unknown, field: string) {
    if (value === undefined || value === null || value === '') return null;
    return this.requireUuid(value, field);
  }

  private requireUuid(value: unknown, field: string) {
    if (typeof value !== 'string' || !this.isUuid(value)) {
      throw new BadRequestException(
        t('artwork_folder.validation.uuid', { args: { field } }),
      );
    }
    return value;
  }

  private positiveInteger(
    value: string | undefined,
    field: string,
    fallback: number,
  ) {
    if (value === undefined || value.trim() === '') return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(
        t('artwork_folder.validation.positive_integer', { args: { field } }),
      );
    }
    return parsed;
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }
}
