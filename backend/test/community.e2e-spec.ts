import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { as, createE2eApp, ids } from './e2e-helpers';

describe('Community API (e2e)', () => {
  let app: INestApplication<App>;
  let mocks: Awaited<ReturnType<typeof createE2eApp>>['mocks'];

  beforeAll(async () => ({ app, mocks } = await createE2eApp()));
  afterAll(async () => app.close());

  it('creates and removes a follow relationship for an authenticated user', async () => {
    await request(app.getHttpServer()).post(`/api/community/followers/${ids.artist}`).set(as('collector-token')).expect(201);
    expect(mocks.followers.follow).toHaveBeenLastCalledWith(ids.collector, ids.artist);
    await request(app.getHttpServer()).delete(`/api/community/followers/${ids.artist}`).set(as('collector-token')).expect(200);
  });

  it('exposes follower lists, counts and current-user follow status', async () => {
    await request(app.getHttpServer()).get(`/api/community/followers/counts/${ids.artist}`).expect(200, { followers: 1, following: 2 });
    await request(app.getHttpServer()).get(`/api/community/followers/followers/${ids.artist}?skip=0&take=20`).expect(200, []);
    await request(app.getHttpServer()).get(`/api/community/followers/following/${ids.artist}`).expect(200, []);
    await request(app.getHttpServer()).get(`/api/community/followers/status/${ids.artist}`).set(as('collector-token')).expect(200, { isFollowing: true });
  });

  it('creates, reads and removes artwork likes', async () => {
    await request(app.getHttpServer()).post(`/api/community/artworks/${ids.artwork}/like`).set(as('collector-token')).expect(201);
    await request(app.getHttpServer()).get(`/api/community/artworks/${ids.artwork}/likes`).expect(200, []);
    await request(app.getHttpServer()).get(`/api/community/artworks/${ids.artwork}/like/status`).set(as('collector-token')).expect(200, { isLiked: true });
    await request(app.getHttpServer()).get(`/api/community/artworks/${ids.artwork}/like/count`).expect(200, { count: 1 });
    await request(app.getHttpServer()).delete(`/api/community/artworks/${ids.artwork}/like`).set(as('collector-token')).expect(200);
  });

  it('validates and manages artwork comments', async () => {
    await request(app.getHttpServer()).post(`/api/community/artworks/${ids.artwork}/comments`).set(as('collector-token')).send({ content: 'Beautiful work' }).expect(201);
    await request(app.getHttpServer()).post(`/api/community/artworks/${ids.artwork}/comments`).set(as('collector-token')).send({ content: '' }).expect(400);
    await request(app.getHttpServer()).get(`/api/community/artworks/${ids.artwork}/comments`).expect(200, []);
    await request(app.getHttpServer()).get(`/api/community/artworks/${ids.artwork}/comments/count`).expect(200, { count: 1 });
    await request(app.getHttpServer()).patch(`/api/community/artworks/${ids.artwork}/comments/comment-1`).set(as('collector-token')).send({ content: 'Amazing work' }).expect(200);
    await request(app.getHttpServer()).delete(`/api/community/artworks/${ids.artwork}/comments/comment-1`).set(as('collector-token')).expect(200);
  });
});
