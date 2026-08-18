import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from './artwork.entity';
import { ArtworksService } from './artworks.service';
import {
  ArtworkImageResponseDto,
  ArtworkResponseDto,
} from './dto/artwork-response.dto';
import { Tag } from './tag.entity';

describe('ArtworksService', () => {
  const sellerId = '123e4567-e89b-12d3-a456-426614174000';

  let artworkRepository: jest.Mocked<Partial<Repository<Artwork>>>;
  let tagRepository: jest.Mocked<Partial<Repository<Tag>>>;
  let service: ArtworksService;

  beforeEach(() => {
    artworkRepository = {
      create: jest.fn((data: Partial<Artwork>) => data as Artwork),
      delete: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((artwork: Artwork) =>
        Promise.resolve({
          ...artwork,
          id: artwork.id ?? '123e4567-e89b-12d3-a456-426614174111',
          createdAt: artwork.createdAt ?? new Date('2026-08-18T10:37:05.141Z'),
        }),
      ),
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
      status: 'available',
    });

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
      currency: 'USD',
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
      createdAt: new Date('2026-08-18T10:37:05.141Z'),
      materials: 'Oil on canvas',
      dimensions: { height: 60, width: 80, unit: 'cm' },
      weight: '2.50',
      internalNote: 'hidden',
    } as Artwork & { internalNote: string };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    artworkRepository.findOne?.mockResolvedValue(artwork);

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
      currency: 'USD',
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
      createdAt: '2026-08-18T10:37:05.141Z',
      materials: 'Oil on canvas',
      dimensions: { height: 60, width: 80, unit: 'cm' },
      weight: '2.50',
    });
    expect(artworkRepository.findOne).toHaveBeenCalledWith({
      where: { id: artworkId },
      relations: { tags: true },
    });
  });

  it('rejects an invalid artwork detail id', async () => {
    await expect(service.findOne('bad-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(artworkRepository.findOne).not.toHaveBeenCalled();
  });

  it('throws not found when artwork detail does not exist', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    artworkRepository.findOne?.mockResolvedValue(null);

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
    } as Artwork;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    artworkRepository.findOne?.mockResolvedValue(artwork);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    tagRepository.find?.mockResolvedValue([tag]);

    const updated = await service.update(artworkId, {
      title: '  Updated Piece  ',
      price: 250,
      currency: 'usd',
      status: 'available',
      isPublished: true,
      materials: 'Oil on canvas',
      tagIds: [tag.id],
    });

    expect(artworkRepository.findOne).toHaveBeenCalledWith({
      where: { id: artworkId },
      relations: { tags: true },
    });
    expect(artworkRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: artworkId,
        title: 'Updated Piece',
        price: '250.00',
        currency: 'USD',
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

  it('rejects an empty artwork update body', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';

    await expect(service.update(artworkId, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(artworkRepository.findOne).not.toHaveBeenCalled();
    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('throws not found when updating a missing artwork', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    artworkRepository.findOne?.mockResolvedValue(null);

    await expect(
      service.update(artworkId, { title: 'Updated Piece' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(artworkRepository.save).not.toHaveBeenCalled();
  });

  it('deletes artwork by id', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    artworkRepository.delete?.mockResolvedValue({
      affected: 1,
      raw: {},
    });

    await expect(service.remove(artworkId)).resolves.toEqual({
      success: true,
    });
    expect(artworkRepository.delete).toHaveBeenCalledWith({ id: artworkId });
  });

  it('rejects an invalid artwork delete id', async () => {
    await expect(service.remove('bad-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(artworkRepository.delete).not.toHaveBeenCalled();
  });

  it('throws not found when deleting a missing artwork', async () => {
    const artworkId = '123e4567-e89b-12d3-a456-426614174222';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    artworkRepository.delete?.mockResolvedValue({
      affected: 0,
      raw: {},
    });

    await expect(service.remove(artworkId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
