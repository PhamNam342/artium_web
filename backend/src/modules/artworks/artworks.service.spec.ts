import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from './artwork.entity';
import { ArtworksService } from './artworks.service';
import {
  AdminArtworkResponseDto,
  AdminListArtworksResponseDto,
  ArtworkImageResponseDto,
  ArtworkResponseDto,
} from './dto/artwork-response.dto';
import { Tag } from './tag.entity';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { ArtworkFolder } from '../artwork-folders/artwork-folder.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/enums/notification-type.enum';
import { NotificationEntityType } from '../notification/enums/notification-entity-type.enum';

describe('ArtworksService', () => {
  const sellerId = '123e4567-e89b-12d3-a456-426614174000';

  let artworkRepository: {
    create: jest.Mock;
    createQueryBuilder: jest.Mock;
    delete: jest.Mock;
    findOne: jest.Mock;
    manager: { transaction: jest.Mock };
    save: jest.Mock;
    update: jest.Mock;
  };
  let tagRepository: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
  };
  let folderRepository: {
    findOne: jest.Mock;
  };
  let notificationService: {
    create: jest.Mock;
  };
  let service: ArtworksService;

  beforeEach(() => {
    artworkRepository = {
      create: jest.fn((data: Partial<Artwork>) => data as Artwork),
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      manager: { transaction: jest.fn() },
      save: jest.fn((artwork: Artwork) =>
        Promise.resolve({
          ...artwork,
          id: artwork.id ?? '123e4567-e89b-12d3-a456-426614174111',
          createdAt: artwork.createdAt ?? new Date('2026-08-18T10:37:05.141Z'),
        }),
      ),
      update: jest.fn(),
    };
    tagRepository = {
      create: jest.fn((data: Partial<Tag>) => data as Tag),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn((tag: Tag) =>
        Promise.resolve({
          ...tag,
          id: tag.id ?? '123e4567-e89b-12d3-a456-426614174444',
        }),
      ),
    };
    folderRepository = {
      findOne: jest.fn(),
    };
    notificationService = {
      create: jest.fn(),
    };

    service = new ArtworksService(
      artworkRepository as unknown as Repository<Artwork>,
      tagRepository as unknown as Repository<Tag>,
      folderRepository as unknown as Repository<ArtworkFolder>,
      notificationService as unknown as NotificationService,
    );
  });

  it('creates an artwork with normalized defaults', async () => {
    const created = await service.create(
      {
        title: '  New Piece  ',
        price: 1500,
        currency: 'vnd',
        materials: 'Oil on canvas',
      },
      sellerId,
    );

    expect(artworkRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId,
        title: 'New Piece',
        description: null,
        price: '1500.00',
        currency: 'VND',
        status: ArtworkStatus.DRAFT,
        isPublished: false,
        images: [],
        folderId: null,
        customTags: [],
        viewCount: 0,
        materials: 'Oil on canvas',
        dimensions: null,
        weight: null,
        tags: [],
      }),
    );
    expect(created.id).toBe('123e4567-e89b-12d3-a456-426614174111');
  });

  it('sorts top picks by like count before creation date', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    artworkRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await service.findAll({ sort: 'top-picks' });

    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      '(SELECT COUNT(*) FROM artwork_likes artwork_like WHERE artwork_like."artworkId" = artwork.id)',
      'like_count',
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('like_count', 'DESC');
    expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
      'artwork.createdAt',
      'DESC',
    );
  });

  it('rejects an invalid artwork price range before querying', async () => {
    await expect(
      service.findAll({ minPrice: '100', maxPrice: '10' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(artworkRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects a folder that is not owned by the artwork seller', async () => {
    folderRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          title: 'New Piece',
          folderId: '123e4567-e89b-12d3-a456-426614174333',
        },
        sellerId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('creates a reusable custom artwork tag', async () => {
    tagRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createTag({ name: '  Commissioned  ' }),
    ).resolves.toEqual({
      id: '123e4567-e89b-12d3-a456-426614174444',
      name: 'Commissioned',
    });

    expect(tagRepository.create).toHaveBeenCalledWith({ name: 'Commissioned' });
    expect(tagRepository.save).toHaveBeenCalledWith({ name: 'Commissioned' });
  });

  it('rejects an invalid seller id before saving', async () => {
    await expect(
      service.create(
        {
          title: 'New Piece',
        },
        'not-a-uuid',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('maps legacy available status to active', async () => {
    await service.create(
      {
        title: 'Published Piece',
        status: 'available',
      },
      sellerId,
    );

    expect(artworkRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ArtworkStatus.ACTIVE,
      }),
    );
  });

  it('finds artwork detail by id with tags', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    const artwork = {
      id: artworkId,
      sellerId,
      title: 'Sunset Study',
      description: 'Oil study on canvas',
      price: '1500.00',
      currency: 'VND',
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
      images: [
        {
          url: 'https://example.com/artwork.jpg',
          altText: 'Sunset Study',
          internalToken: 'hidden',
        },
      ],
      folderId: null,
      viewCount: 4,
      tags: [{ id: '123e4567-e89b-12d3-a456-426614174333', name: 'Oil' }],
      customTags: ['Framed'],
      createdAt: new Date('2026-08-18T10:37:05.141Z'),
      materials: 'Oil on canvas',
      dimensions: { height: 60, width: 80, unit: 'cm' },
      weight: '2.50',
      internalNote: 'hidden',
    } as unknown as Artwork & { internalNote: string };

    artworkRepository.findOne.mockResolvedValue(artwork);

    const response = await service.findOne(artworkId);

    expect(response).toBeInstanceOf(ArtworkResponseDto);
    expect(response.images[0]).toBeInstanceOf(ArtworkImageResponseDto);
    expect(response).not.toHaveProperty('internalNote');
    expect(response.images[0]).not.toHaveProperty('internalToken');
    expect(response).toEqual({
      id: artworkId,
      sellerId,
      title: 'Sunset Study',
      description: 'Oil study on canvas',
      price: '1500.00',
      currency: 'VND',
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
      images: [
        {
          url: 'https://example.com/artwork.jpg',
          altText: 'Sunset Study',
        },
      ],
      folderId: null,
      viewCount: 4,
      tags: [{ id: '123e4567-e89b-12d3-a456-426614174333', name: 'Oil' }],
      customTags: ['Framed'],
      createdAt: '2026-08-18T10:37:05.141Z',
      materials: 'Oil on canvas',
      location: null,
      dimensions: { height: 60, width: 80, unit: 'cm' },
      weight: '2.50',
    });
    expect(artworkRepository.findOne).toHaveBeenCalledWith({
      where: [
        {
          id: artworkId,
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
        },
      ],
      relations: { tags: true },
    });
  });

  it('allows an artwork owner to read an unpublished draft', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    artworkRepository.findOne.mockResolvedValue({
      id: artworkId,
      sellerId,
      title: 'Private Draft',
      status: ArtworkStatus.DRAFT,
      isPublished: false,
      images: [],
      tags: [],
      customTags: [],
    });

    await expect(service.findOne(artworkId, sellerId)).resolves.toMatchObject({
      id: artworkId,
      status: ArtworkStatus.DRAFT,
    });

    expect(artworkRepository.findOne).toHaveBeenCalledWith({
      where: [
        {
          id: artworkId,
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
        },
        { id: artworkId, sellerId },
      ],
      relations: { tags: true },
    });
  });

  it("lists only the authenticated seller's artworks, including drafts", async () => {
    const artwork = {
      id: '123e4567-e89b-12d3-a456-426614174222',
      sellerId,
      title: 'Private Draft',
      status: ArtworkStatus.DRAFT,
      isPublished: false,
      images: [],
      tags: [],
      createdAt: new Date('2026-08-18T10:37:05.141Z'),
    } as unknown as Artwork;
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[artwork], 1]),
    };
    artworkRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.findMine(sellerId, {})).resolves.toEqual({
      data: [
        expect.objectContaining({
          id: artwork.id,
          status: ArtworkStatus.DRAFT,
        }),
      ],
      meta: {
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'artwork.seller_id = :sellerId',
      { sellerId },
    );
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      'artwork.is_published = :isPublished',
      expect.anything(),
    );
  });

  it('maps admin artwork rows to a safe response DTO', async () => {
    const countQuery = {
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ cnt: '1' }),
    };
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnValue(countQuery),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          id: '123e4567-e89b-12d3-a456-426614174222',
          sellerId,
          sellerName: 'Artist Name',
          sellerEmail: 'artist@example.com',
          sellerAvatarUrl: 'https://example.com/avatar.jpg',
          title: 'Sunset Study',
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
          price: '1500.00',
          currency: 'VND',
          images: [
            {
              url: 'https://example.com/artwork.jpg',
              isPrimary: true,
              internalToken: 'do-not-expose',
            },
          ],
          createdAt: new Date('2026-08-18T10:37:05.141Z'),
        },
      ]),
    };
    artworkRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const response = await service.adminFindAll({});

    expect(response).toBeInstanceOf(AdminListArtworksResponseDto);
    expect(response.data[0]).toBeInstanceOf(AdminArtworkResponseDto);
    expect(response).toEqual({
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174222',
          sellerId,
          sellerName: 'Artist Name',
          sellerEmail: 'artist@example.com',
          sellerAvatarUrl: 'https://example.com/avatar.jpg',
          title: 'Sunset Study',
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
          price: '1500.00',
          currency: 'VND',
          images: [
            {
              url: 'https://example.com/artwork.jpg',
              isPrimary: true,
            },
          ],
          createdAt: '2026-08-18T10:37:05.141Z',
        },
      ],
      meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'artwork.status != :deletedStatus',
      { deletedStatus: ArtworkStatus.DELETED },
    );
  });

  it('rejects an invalid artwork detail id', async () => {
    await expect(service.findOne('bad-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(artworkRepository.findOne).not.toHaveBeenCalled();
  });

  it('throws not found when artwork detail does not exist', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    artworkRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(artworkId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates artwork fields and tag relations', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    const tag = {
      id: '123e4567-e89b-12d3-a456-426614174333',
      name: 'Oil',
    } as Tag;
    const artwork = {
      id: artworkId,
      sellerId,
      title: 'Old Piece',
      price: '100.00',
      status: ArtworkStatus.DRAFT,
      isPublished: false,
      tags: [],
    } as unknown as Artwork;

    artworkRepository.findOne.mockResolvedValue(artwork);
    tagRepository.find.mockResolvedValue([tag]);

    const updated = await service.update(
      artworkId,
      {
        title: '  Updated Piece  ',
        price: 250,
        currency: 'vnd',
        status: 'available',
        isPublished: true,
        materials: 'Oil on canvas',
        tagIds: [tag.id],
      },
      sellerId,
    );

    expect(artworkRepository.findOne).toHaveBeenCalledWith({
      where: { id: artworkId, sellerId },
      relations: { tags: true },
    });
    expect(artworkRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: artworkId,
        title: 'Updated Piece',
        price: '250.00',
        currency: 'VND',
        status: ArtworkStatus.ACTIVE,
        isPublished: true,
        materials: 'Oil on canvas',
        tags: [tag],
      }),
    );
    expect(updated).toEqual(
      expect.objectContaining({
        id: artworkId,
        title: 'Updated Piece',
        status: ArtworkStatus.ACTIVE,
      }),
    );
  });

  it('updates image metadata after the validation pipe adds undefined fields', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174555';
    const artwork = {
      id: artworkId,
      sellerId,
      title: 'Image update',
      description: null,
      price: null,
      currency: null,
      status: ArtworkStatus.DRAFT,
      isPublished: false,
      images: [],
      folderId: null,
      viewCount: 0,
      customTags: [],
      tags: [],
      createdAt: new Date('2026-08-18T10:37:05.141Z'),
      materials: null,
      dimensions: null,
      weight: null,
    } as unknown as Artwork;

    artworkRepository.findOne.mockResolvedValue(artwork);

    const updateInput = plainToInstance(UpdateArtworkDto, {
      images: [{ url: 'http://localhost:3000/uploads/image.jpg' }],
    });

    await expect(
      service.update(artworkId, updateInput, sellerId),
    ).resolves.toMatchObject({
      id: artworkId,
      images: [{ url: 'http://localhost:3000/uploads/image.jpg' }],
    });

    expect(artworkRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          {
            url: 'http://localhost:3000/uploads/image.jpg',
            secureUrl: undefined,
            alt: undefined,
            altText: undefined,
          },
        ],
      }),
    );
  });

  it('rejects an empty artwork update body', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';

    await expect(
      service.update(artworkId, {}, sellerId),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(artworkRepository.findOne).not.toHaveBeenCalled();
    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('throws not found when updating a missing artwork', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    artworkRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(artworkId, { title: 'Updated Piece' }, sellerId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('does not allow an artist to restore an artwork removed by an admin', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    artworkRepository.findOne.mockResolvedValue({
      id: artworkId,
      sellerId,
      status: ArtworkStatus.DELETED,
      tags: [],
    });

    await expect(
      service.update(artworkId, { isPublished: true }, sellerId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('only updates artwork owned by the authenticated seller', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    const otherSellerId = '123e4567-e89b-12d3-a456-426614174001';
    artworkRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(artworkId, { title: 'Not mine' }, otherSellerId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(artworkRepository.findOne).toHaveBeenCalledWith({
      where: { id: artworkId, sellerId: otherSellerId },
      relations: { tags: true },
    });
    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('marks an artist artwork as deleted instead of removing its order history', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    artworkRepository.update.mockResolvedValue({
      affected: 1,
      raw: {},
    });

    await expect(service.remove(artworkId, sellerId)).resolves.toEqual({
      success: true,
    });
    expect(artworkRepository.update).toHaveBeenCalledWith(
      { id: artworkId, sellerId },
      { status: ArtworkStatus.DELETED, isPublished: false },
    );
    expect(artworkRepository.delete).not.toHaveBeenCalled();
  });

  it('rejects an invalid artwork delete id', async () => {
    await expect(service.remove('bad-id', sellerId)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(artworkRepository.update).not.toHaveBeenCalled();
  });

  it('throws not found when deleting a missing artwork', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    artworkRepository.update.mockResolvedValue({
      affected: 0,
      raw: {},
    });

    await expect(service.remove(artworkId, sellerId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('only deletes artwork owned by the authenticated seller', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    const otherSellerId = '123e4567-e89b-12d3-a456-426614174001';
    artworkRepository.update.mockResolvedValue({
      affected: 0,
      raw: {},
    });

    await expect(
      service.remove(artworkId, otherSellerId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(artworkRepository.update).toHaveBeenCalledWith(
      { id: artworkId, sellerId: otherSellerId },
      { status: ArtworkStatus.DELETED, isPublished: false },
    );
  });

  it('marks an admin-removed artwork as deleted and keeps its order history', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    const adminId = '123e4567-e89b-12d3-a456-426614174999';
    artworkRepository.findOne.mockResolvedValue({
      id: artworkId,
      sellerId,
      title: 'Sunset Study',
      status: ArtworkStatus.RESERVED,
    });
    artworkRepository.update.mockResolvedValue({ affected: 1, raw: {} });

    await expect(
      service.adminRemove(artworkId, adminId, 'Violates guidelines'),
    ).resolves.toEqual({ success: true });

    expect(artworkRepository.update).toHaveBeenCalledWith(
      { id: artworkId },
      { status: ArtworkStatus.DELETED, isPublished: false },
    );
    expect(artworkRepository.delete).not.toHaveBeenCalled();
    expect(notificationService.create).toHaveBeenCalledWith({
      recipientId: sellerId,
      actorId: adminId,
      type: NotificationType.ARTWORK_DELETED_BY_ADMIN,
      entityType: NotificationEntityType.ARTWORK,
      entityId: artworkId,
      title: 'Artwork Removed',
      message:
        'Your artwork "Sunset Study" has been removed by an administrator. Reason: Violates guidelines',
    });
  });

  it('moves all selected artworks to an owned folder atomically', async () => {
    const firstArtworkId = '123e4567-e89b-12d3-a456-426614174222';
    const secondArtworkId = '123e4567-e89b-12d3-a456-426614174223';
    const folderId = '123e4567-e89b-12d3-a456-426614174333';
    const manager = {
      count: jest.fn().mockResolvedValue(2),
      update: jest.fn().mockResolvedValue({ affected: 2 }),
    };
    folderRepository.findOne.mockResolvedValue({ id: folderId });
    artworkRepository.manager.transaction.mockImplementation(
      async (
        callback: (transactionManager: typeof manager) => Promise<unknown>,
      ) => callback(manager),
    );

    await expect(
      service.bulkMove(
        { artworkIds: [firstArtworkId, secondArtworkId], folderId },
        sellerId,
      ),
    ).resolves.toEqual({ movedCount: 2 });

    expect(folderRepository.findOne).toHaveBeenCalledWith({
      where: { id: folderId, sellerId },
      select: { id: true },
    });
    expect(manager.count).toHaveBeenCalledTimes(1);
    expect(manager.update).toHaveBeenCalledTimes(1);
  });

  it('does not move anything when one selected artwork is not owned by the seller', async () => {
    const firstArtworkId = '123e4567-e89b-12d3-a456-426614174222';
    const secondArtworkId = '123e4567-e89b-12d3-a456-426614174223';
    const folderId = '123e4567-e89b-12d3-a456-426614174333';
    const manager = {
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn(),
    };
    folderRepository.findOne.mockResolvedValue({ id: folderId });
    artworkRepository.manager.transaction.mockImplementation(
      async (
        callback: (transactionManager: typeof manager) => Promise<unknown>,
      ) => callback(manager),
    );

    await expect(
      service.bulkMove(
        { artworkIds: [firstArtworkId, secondArtworkId], folderId },
        sellerId,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(manager.update).not.toHaveBeenCalled();
  });
});
