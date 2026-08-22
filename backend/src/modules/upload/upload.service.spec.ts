import { readFile, rm, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { Artwork } from '../artworks/artwork.entity';
import { LocalStorageService } from './storage/local-storage.service';
import { UploadService } from './upload.service';
import { UploadedArtworkFile } from './upload.types';

describe('UploadService', () => {
  let previousUploadRoot: string | undefined;
  let uploadRoot: string;
  let service: UploadService;
  let artworkRepository: Pick<Repository<Artwork>, 'findOneBy'>;

  beforeEach(async () => {
    previousUploadRoot = process.env.UPLOAD_ROOT;
    uploadRoot = await mkdtemp(join(tmpdir(), 'artium-upload-'));
    process.env.UPLOAD_ROOT = uploadRoot;
    artworkRepository = { findOneBy: jest.fn().mockResolvedValue({}) };
    service = new UploadService(
      new LocalStorageService(),
      artworkRepository as Repository<Artwork>,
    );
  });

  afterEach(async () => {
    if (previousUploadRoot === undefined) {
      delete process.env.UPLOAD_ROOT;
    } else {
      process.env.UPLOAD_ROOT = previousUploadRoot;
    }

    await rm(uploadRoot, { recursive: true, force: true });
  });

  it('uploads artwork images and returns public metadata', async () => {
    const file: UploadedArtworkFile = {
      buffer: Buffer.from('fake image'),
      originalname: 'Sunset Study.png',
      mimetype: 'image/png',
      size: 10,
    };

    const result = await service.uploadArtworkImages(
      [file],
      {
        artworkId: 'artwork id',
        altText: 'Sunset Study',
      },
      'seller/id',
      'http://localhost:3000',
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        url: expect.stringMatching(
          /^http:\/\/localhost:3000\/uploads\/artwork-images\/seller-id\/artwork-id\/.+\.png$/,
        ),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        secureUrl: expect.stringMatching(
          /^http:\/\/localhost:3000\/uploads\/artwork-images\/seller-id\/artwork-id\/.+\.png$/,
        ),
        format: 'png',
        size: 10,
        bucket: 'local-artium-uploads',
        altText: 'Sunset Study',
        order: 0,
        isPrimary: true,
      }),
    );
    await expect(
      readFile(join(uploadRoot, result[0].publicId)),
    ).resolves.toEqual(Buffer.from('fake image'));
  });

  it('rejects empty uploads', async () => {
    await expect(
      service.uploadArtworkImages(
        [],
        { artworkId: 'art' },
        'seller',
        'http://localhost:3000',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-image files', async () => {
    await expect(
      service.uploadArtworkImages(
        [
          {
            buffer: Buffer.from('text'),
            originalname: 'note.txt',
            mimetype: 'text/plain',
            size: 4,
          },
        ],
        { artworkId: 'art' },
        'seller',
        'http://localhost:3000',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects uploads for an artwork not owned by the authenticated seller', async () => {
    artworkRepository.findOneBy.mockResolvedValueOnce(null);

    await expect(
      service.uploadArtworkImages(
        [{ buffer: Buffer.from('fake image'), originalname: 'test.png', mimetype: 'image/png', size: 10 }],
        { artworkId: 'artwork-id' },
        'authenticated-seller',
        'http://localhost:3000',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(artworkRepository.findOneBy).toHaveBeenCalledWith({
      id: 'artwork-id',
      sellerId: 'authenticated-seller',
    });
  });
});
