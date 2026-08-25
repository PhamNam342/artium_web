import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Artwork } from '../artworks/artwork.entity';
import { ArtworkFolder } from './artwork-folder.entity';
import { ArtworkFoldersService } from './artwork-folders.service';

describe('ArtworkFoldersService', () => {
  const sellerId = '123e4567-e89b-12d3-a456-426614174000';
  const rootId = '123e4567-e89b-12d3-a456-426614174001';
  const childId = '123e4567-e89b-12d3-a456-426614174002';
  const createdAt = new Date('2026-08-24T05:00:00.000Z');

  let folderRepository: {
    count: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let artworkRepository: {
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let service: ArtworkFoldersService;

  const makeFolder = (
    overrides: Partial<ArtworkFolder> = {},
  ): ArtworkFolder => ({
    id: rootId,
    sellerId,
    name: 'Portfolio 2026',
    parentId: null,
    isVisible: true,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  });

  beforeEach(() => {
    folderRepository = {
      count: jest.fn(),
      create: jest.fn((data: Partial<ArtworkFolder>) => data as ArtworkFolder),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    artworkRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: { transaction: jest.fn() },
    };
    service = new ArtworkFoldersService(
      folderRepository as unknown as Repository<ArtworkFolder>,
      artworkRepository as unknown as Repository<Artwork>,
    );
  });

  it('creates a root folder when parentId is null', async () => {
    const savedFolder = makeFolder();
    folderRepository.save.mockResolvedValue(savedFolder);

    const response = await service.create(sellerId, {
      name: '  Portfolio 2026  ',
      parentId: null,
    });

    expect(folderRepository.create).toHaveBeenCalledWith({
      sellerId,
      name: 'Portfolio 2026',
      parentId: null,
    });
    expect(folderRepository.findOne).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      id: rootId,
      name: 'Portfolio 2026',
      parentId: null,
      artworkCount: 0,
    });
  });

  it('builds a folder tree with the direct artwork count for each folder', async () => {
    const root = makeFolder();
    const child = makeFolder({
      id: childId,
      name: 'Landscapes',
      parentId: rootId,
    });
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { folderId: rootId, count: '2' },
        { folderId: childId, count: '1' },
      ]),
    };
    folderRepository.find.mockResolvedValue([root, child]);
    artworkRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const tree = await service.findTree(sellerId);

    expect(tree).toEqual([
      expect.objectContaining({
        id: rootId,
        artworkCount: 2,
        children: [
          expect.objectContaining({
            id: childId,
            artworkCount: 1,
            children: [],
          }),
        ],
      }),
    ]);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'artwork.seller_id = :sellerId',
      { sellerId },
    );
  });

  it('rejects moving a folder into one of its descendants', async () => {
    const root = makeFolder();
    const child = makeFolder({ id: childId, parentId: rootId });
    folderRepository.findOne
      .mockResolvedValueOnce(root)
      .mockResolvedValueOnce(child)
      .mockResolvedValueOnce(child);

    await expect(
      service.move(rootId, sellerId, { parentId: childId }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(folderRepository.save).not.toHaveBeenCalled();
  });

  it('unassigns artworks and deletes a childless folder in one transaction', async () => {
    const folder = makeFolder({ id: childId, parentId: rootId });
    const manager = {
      update: jest.fn().mockResolvedValue({ affected: 2 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    folderRepository.findOne.mockResolvedValue(folder);
    folderRepository.count.mockResolvedValue(0);
    artworkRepository.manager.transaction.mockImplementation(
      async (callback: (transactionManager: typeof manager) => Promise<void>) =>
        callback(manager),
    );

    await expect(service.remove(childId, sellerId)).resolves.toEqual({
      success: true,
    });

    expect(artworkRepository.manager.transaction).toHaveBeenCalledTimes(1);
    expect(manager.update).toHaveBeenCalledWith(
      Artwork,
      { folderId: childId },
      { folderId: null },
    );
    expect(manager.delete).toHaveBeenCalledWith(ArtworkFolder, {
      id: childId,
      sellerId,
    });
  });
});
