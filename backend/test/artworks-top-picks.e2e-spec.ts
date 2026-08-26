import { INestApplication, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'node:http';
import { DataSource, In, type Repository } from 'typeorm';
import request from 'supertest';

import { getTestDatabaseOptions } from '../src/config/test-database.config';
import { Artwork, ArtworkStatus } from '../src/modules/artworks/artwork.entity';
import { ArtworkFolder } from '../src/modules/artwork-folders/artwork-folder.entity';
import { ArtworksController } from '../src/modules/artworks/artworks.controller';
import { ArtworksService } from '../src/modules/artworks/artworks.service';
import { Tag } from '../src/modules/artworks/tag.entity';
import { ArtworkLike } from '../src/modules/community/artwork/likes/entities/artwork-like.entity';
import { NotificationService } from '../src/modules/notification/notification.service';
import { User, UserRole } from '../src/identity/user/entities/user.entity';

interface TopPicksArtworkResponse {
  title: string;
}

interface TopPicksResponse {
  data: TopPicksArtworkResponse[];
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...getTestDatabaseOptions(),
      entities: [Artwork, ArtworkFolder, ArtworkLike, Tag, User],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Artwork, ArtworkFolder, Tag]),
  ],
  controllers: [ArtworksController],
  providers: [
    ArtworksService,
    {
      provide: NotificationService,
      useValue: {},
    },
  ],
})
class ArtworksTopPicksTestModule {}

describe('Artworks top picks (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let artworkRepository: Repository<Artwork>;
  let artworkLikeRepository: Repository<ArtworkLike>;
  let userRepository: Repository<User>;

  const testRunId = `top-picks-${Date.now()}`;
  const userIds: string[] = [];
  const artworkIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ArtworksTopPicksTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    dataSource = app.get(DataSource);

    artworkRepository = dataSource.getRepository(Artwork);
    artworkLikeRepository = dataSource.getRepository(ArtworkLike);
    userRepository = dataSource.getRepository(User);
  });

  afterAll(async () => {
    if (artworkIds.length > 0) {
      await artworkLikeRepository.delete({
        artworkId: In(artworkIds),
      });

      await artworkRepository.delete({
        id: In(artworkIds),
      });
    }

    if (userIds.length > 0) {
      await userRepository.delete({
        id: In(userIds),
      });
    }

    await app?.close();
  });

  it('orders published artworks by like count, then newest creation date', async () => {
    const users = await userRepository.save(
      Array.from({ length: 5 }, (_, index) =>
        userRepository.create({
          email: `${testRunId}-user-${index}@example.test`,
          full_name: `Top picks tester ${index}`,
          role: UserRole.COLLECTOR,
          is_active: true,
        }),
      ),
    );

    userIds.push(...users.map((user) => user.id));

    const sellerId = users[0].id;

    const olderTopPick = await artworkRepository.save(
      artworkRepository.create({
        sellerId,
        title: `${testRunId} older-top-pick`,
        description: 'Top picks integration test artwork',
        price: '100000.00',
        currency: 'VND',
        status: ArtworkStatus.ACTIVE,
        isPublished: true,
        images: [],
        folderId: null,
        viewCount: 0,
        customTags: [],
        materials: null,
        location: null,
        dimensions: null,
        weight: null,
      }),
    );

    const newerTopPick = await artworkRepository.save(
      artworkRepository.create({
        sellerId,
        title: `${testRunId} newer-top-pick`,
        description: 'Top picks integration test artwork',
        price: '100000.00',
        currency: 'VND',
        status: ArtworkStatus.ACTIVE,
        isPublished: true,
        images: [],
        folderId: null,
        viewCount: 0,
        customTags: [],
        materials: null,
        location: null,
        dimensions: null,
        weight: null,
      }),
    );

    const lowerPick = await artworkRepository.save(
      artworkRepository.create({
        sellerId,
        title: `${testRunId} lower-pick`,
        description: 'Top picks integration test artwork',
        price: '100000.00',
        currency: 'VND',
        status: ArtworkStatus.ACTIVE,
        isPublished: true,
        images: [],
        folderId: null,
        viewCount: 0,
        customTags: [],
        materials: null,
        location: null,
        dimensions: null,
        weight: null,
      }),
    );

    artworkIds.push(olderTopPick.id, newerTopPick.id, lowerPick.id);

    await artworkRepository.update(olderTopPick.id, {
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    });

    await artworkRepository.update(newerTopPick.id, {
      createdAt: new Date('2025-01-02T00:00:00.000Z'),
    });

    await artworkLikeRepository.save([
      ...users.slice(1, 4).map((user) =>
        artworkLikeRepository.create({
          artworkId: olderTopPick.id,
          userId: user.id,
        }),
      ),

      ...users.slice(1, 4).map((user) =>
        artworkLikeRepository.create({
          artworkId: newerTopPick.id,
          userId: user.id,
        }),
      ),

      artworkLikeRepository.create({
        artworkId: lowerPick.id,
        userId: users[4].id,
      }),
    ]);

    const response = await request(app.getHttpServer() as Server)
      .get('/artworks')
      .query({
        search: testRunId,
        sort: 'top-picks',
      })
      .expect(200);

    const body = response.body as TopPicksResponse;

    expect(body.data.map((artwork) => artwork.title)).toEqual([
      newerTopPick.title,
      olderTopPick.title,
      lowerPick.title,
    ]);
  });
});
