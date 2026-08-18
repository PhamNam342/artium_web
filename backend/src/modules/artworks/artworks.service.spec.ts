import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from './artwork.entity';
import { ArtworksService } from './artworks.service';
import { Tag } from './tag.entity';

describe('ArtworksService', () => {
  const sellerId = '123e4567-e89b-12d3-a456-426614174000';

  let artworkRepository: jest.Mocked<Partial<Repository<Artwork>>>;
  let tagRepository: jest.Mocked<Partial<Repository<Tag>>>;
  let service: ArtworksService;

  beforeEach(() => {
    artworkRepository = {
      create: jest.fn((data: Partial<Artwork>) => data as Artwork),
      save: jest.fn(async (artwork: Artwork) => ({
        ...artwork,
        id: '123e4567-e89b-12d3-a456-426614174111',
      })),
    };
    tagRepository = {
      find: jest.fn(),
    };

    service = new ArtworksService(
      artworkRepository as Repository<Artwork>,
      tagRepository as Repository<Tag>,
    );
  });

  it('creates an artwork with normalized defaults', async () => {
    const created = await service.create({
      sellerId,
      title: '  New Piece  ',
      price: 1500,
      currency: 'usd',
      materials: 'Oil on canvas',
    });

    expect(artworkRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId,
        title: 'New Piece',
        description: null,
        price: '1500.00',
        currency: 'USD',
        status: ArtworkStatus.DRAFT,
        isPublished: false,
        images: [],
        folderId: null,
        viewCount: 0,
        materials: 'Oil on canvas',
        dimensions: null,
        weight: null,
        tags: [],
      }),
    );
    expect(created.id).toBe('123e4567-e89b-12d3-a456-426614174111');
  });

  it('rejects an invalid seller id before saving', async () => {
    await expect(
      service.create({
        sellerId: 'not-a-uuid',
        title: 'New Piece',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('maps legacy available status to active', async () => {
    await service.create({
      sellerId,
      title: 'Published Piece',
      status: 'available' as ArtworkStatus,
    });

    expect(artworkRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ArtworkStatus.ACTIVE,
      }),
    );
  });
});
