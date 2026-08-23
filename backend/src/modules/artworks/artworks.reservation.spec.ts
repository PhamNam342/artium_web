import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from './artwork.entity';
import { ArtworksService } from './artworks.service';
import { Tag } from './tag.entity';

describe('ArtworksService reservation rules', () => {
  it('does not allow an artist to publish a reserved artwork', async () => {
    const artwork = {
      id: '123e4567-e89b-12d3-a456-426614174222',
      sellerId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Reserved piece',
      status: ArtworkStatus.RESERVED,
      isPublished: false,
      images: [],
      tags: [],
      customTags: [],
    } as unknown as Artwork;
    const save = jest.fn();
    const artworkRepository = {
      findOne: jest.fn().mockResolvedValue(artwork),
      save,
    } as unknown as Repository<Artwork>;
    const tagRepository = {} as Repository<Tag>;
    const service = new ArtworksService(artworkRepository, tagRepository);

    await expect(
      service.update(artwork.id, { isPublished: true }, artwork.sellerId),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(save).not.toHaveBeenCalled();
  });
});
