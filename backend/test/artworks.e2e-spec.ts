import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { as, createE2eApp, ids } from './e2e-helpers';

describe('Artworks, uploads and folders API (e2e)', () => {
  let app: INestApplication<App>;
  let mocks: Awaited<ReturnType<typeof createE2eApp>>['mocks'];

  beforeAll(async () => ({ app, mocks } = await createE2eApp()));
  afterAll(async () => app.close());

  it('serves the health endpoint and public artwork catalogue', async () => {
    await request(app.getHttpServer()).get('/api').expect(200).expect('Hello World!');
    await request(app.getHttpServer()).get(`/api/artworks?sellerId=${ids.artist}&search=sun`).expect(200);
    await request(app.getHttpServer()).get('/api/artwork/tags').expect(200, []);
    await request(app.getHttpServer()).get(`/api/artwork/${ids.artwork}`).expect(200, { id: ids.artwork });
    expect(mocks.artworks.findOne).toHaveBeenLastCalledWith(ids.artwork, undefined);
  });

  it('requires an artist and validates artwork creation', async () => {
    await request(app.getHttpServer()).post('/api/artworks').set(as('collector-token')).send({ title: 'Denied' }).expect(403);
    await request(app.getHttpServer()).post('/api/artworks').set(as('artist-token')).send({ title: '' }).expect(400);
    await request(app.getHttpServer()).post('/api/artworks').set(as('artist-token')).send({ title: 'Sunrise', price: 1000000, images: [{ url: 'https://image.test/sunrise.jpg' }] }).expect(201);
    expect(mocks.artworks.create).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Sunrise', price: 1000000 }), ids.artist);
  });

  it('covers artist artwork CRUD, tags and state transitions', async () => {
    await request(app.getHttpServer()).get('/api/artworks/mine?page=1').set(as('artist-token')).expect(200);
    await request(app.getHttpServer()).post('/api/artworks/tags').set(as('artist-token')).send({ name: 'Abstract' }).expect(201);
    await request(app.getHttpServer()).put(`/api/artworks/${ids.artwork}`).set(as('artist-token')).send({ title: 'Morning' }).expect(200);
    await request(app.getHttpServer()).patch(`/api/artworks/${ids.artwork}`).set(as('artist-token')).send({ description: 'Updated' }).expect(200);
    await request(app.getHttpServer()).patch(`/api/artworks/${ids.artwork}/status`).set(as('artist-token')).send({ status: 'ACTIVE' }).expect(200);
    await request(app.getHttpServer()).patch(`/api/artworks/${ids.artwork}/publish`).set(as('artist-token')).send({ isPublished: true }).expect(200);
    await request(app.getHttpServer()).post('/api/artworks/bulk/move').set(as('artist-token')).send({ artworkIds: [ids.artwork], folderId: ids.folder }).expect(201, { movedCount: 1 });
    await request(app.getHttpServer()).delete(`/api/artworks/${ids.artwork}`).set(as('artist-token')).expect(200);
  });

  it('allows only admins to browse and delete all artworks', async () => {
    await request(app.getHttpServer()).get('/api/artworks/admin/list').set(as('admin-token')).expect(200);
    await request(app.getHttpServer()).delete(`/api/artworks/admin/${ids.artwork}`).set(as('admin-token')).send({ reason: 'Policy violation' }).expect(200);
    expect(mocks.artworks.adminRemove).toHaveBeenLastCalledWith(ids.artwork, ids.admin, 'Policy violation');
  });

  it('uploads artwork files and manages the artist folder tree', async () => {
    await request(app.getHttpServer()).post('/api/upload/artwork-images').set(as('artist-token')).field('artworkId', ids.artwork).attach('files', Buffer.from('image'), 'image.jpg').expect(201);
    expect(mocks.uploads.uploadArtworkImages).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ artworkId: ids.artwork }), ids.artist, expect.stringContaining('http://'));
    await request(app.getHttpServer()).post(`/api/sellers/${ids.collector}/artwork-folders`).set(as('artist-token')).send({ name: 'Private' }).expect(403);
    await request(app.getHttpServer()).post(`/api/sellers/${ids.artist}/artwork-folders`).set(as('artist-token')).send({ name: 'Portfolio' }).expect(201);
    await request(app.getHttpServer()).get(`/api/sellers/${ids.artist}/artwork-folders/tree`).set(as('artist-token')).expect(200, []);
    await request(app.getHttpServer()).get(`/api/artwork-folders/${ids.folder}`).set(as('artist-token')).expect(200);
    await request(app.getHttpServer()).patch(`/api/artwork-folders/${ids.folder}`).set(as('artist-token')).send({ isVisible: true }).expect(200);
    await request(app.getHttpServer()).get(`/api/artwork-folders/${ids.folder}/artworks?page=1&limit=10`).set(as('artist-token')).expect(200);
    await request(app.getHttpServer()).patch(`/api/artwork-folders/${ids.folder}/move`).set(as('artist-token')).send({ parentId: null }).expect(200);
    await request(app.getHttpServer()).delete(`/api/artwork-folders/${ids.folder}`).set(as('artist-token')).expect(200);
  });
});
