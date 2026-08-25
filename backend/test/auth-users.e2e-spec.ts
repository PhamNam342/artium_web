import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { as, createE2eApp, ids } from './e2e-helpers';

describe('Auth and users API (e2e)', () => {
  let app: INestApplication<App>;
  let mocks: Awaited<ReturnType<typeof createE2eApp>>['mocks'];

  beforeAll(async () => ({ app, mocks } = await createE2eApp()));
  afterAll(async () => app.close());

  it('validates and initiates registration', async () => {
    await request(app.getHttpServer()).post('/api/auth/register/initiate').send({ email: 'invalid', password: 'short' }).expect(400);
    await request(app.getHttpServer()).post('/api/auth/register/initiate').send({ email: 'new@test.local', password: 'secret1' }).expect(200);
    expect(mocks.auth.initiateRegister).toHaveBeenLastCalledWith('new@test.local', 'secret1');
  });

  it('handles completion, login and password recovery', async () => {
    await request(app.getHttpServer()).post('/api/auth/register/complete').send({ email: 'new@test.local', otp: '123456', name: 'New User' }).expect(201, { access_token: 'access-token' });
    await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'new@test.local', password: 'secret1' }).expect(200, { access_token: 'access-token' });
    await request(app.getHttpServer()).post('/api/auth/google').send({ idToken: 'google-token' }).expect(200, { access_token: 'google-token' });
    await request(app.getHttpServer()).post('/api/auth/forgot-password').send({ email: 'new@test.local' }).expect(200);
    await request(app.getHttpServer()).post('/api/auth/forgot-password/verify').send({ email: 'new@test.local', otp: '123456' }).expect(200, { reset_token: 'reset-token' });
    await request(app.getHttpServer()).post('/api/auth/forgot-password/reset').send({ resetToken: 'reset-token', newPassword: 'new-secret' }).expect(200);
  });

  it('requires a token for protected account operations', async () => {
    await request(app.getHttpServer()).get('/api/identity/users/me').expect(401);
    await request(app.getHttpServer()).patch('/api/auth/change-password').send({ currentPassword: 'secret1', newPassword: 'new-secret' }).expect(401);
  });

  it('updates the authenticated user profile, password, avatar and logout state', async () => {
    await request(app.getHttpServer()).patch('/api/auth/profile/complete').set(as('artist-token')).send({ role: 'ARTIST', full_name: 'Artist', location: 'HCM' }).expect(200, { access_token: 'profile-token' });
    await request(app.getHttpServer()).patch('/api/auth/change-password').set(as('artist-token')).send({ currentPassword: 'secret1', newPassword: 'new-secret' }).expect(200);
    await request(app.getHttpServer()).get('/api/identity/users/me').set(as('artist-token')).expect(200, { id: ids.artist });
    await request(app.getHttpServer()).patch('/api/identity/users/profile').set(as('artist-token')).send({ full_name: 'Renamed' }).expect(200);
    await request(app.getHttpServer()).post('/api/identity/users/avatar').set(as('artist-token')).attach('file', Buffer.from('avatar'), 'avatar.jpg').expect(201);
    expect(mocks.uploads.uploadAvatar).toHaveBeenLastCalledWith(expect.any(Object), ids.artist, 'http://test.local');
    await request(app.getHttpServer()).delete('/api/identity/users/me').set(as('artist-token')).expect(200);
    await request(app.getHttpServer()).post('/api/auth/logout').set(as('artist-token')).expect(200);
    expect(mocks.auth.logout).toHaveBeenLastCalledWith('artist-token');
  });

  it('serves public profiles and enforces admin routes', async () => {
    await request(app.getHttpServer()).get('/api/identity/users/artists').expect(200, []);
    await request(app.getHttpServer()).get(`/api/identity/users/${ids.artist}`).expect(200, { id: ids.artist });
    await request(app.getHttpServer()).get('/api/identity/users/admin/dashboard').set(as('artist-token')).expect(403);
    await request(app.getHttpServer()).get('/api/identity/users/admin/dashboard').set(as('admin-token')).expect(200, { totalUsers: 3 });
    await request(app.getHttpServer()).get('/api/identity/users/admin/list?page=2&limit=200&search=artist&isActive=false').set(as('admin-token')).expect(200);
    expect(mocks.users.findAllUsers).toHaveBeenLastCalledWith(2, 100, 'artist', false);
    await request(app.getHttpServer()).get(`/api/identity/users/admin/${ids.artist}`).set(as('admin-token')).expect(200);
    await request(app.getHttpServer()).patch(`/api/identity/users/admin/${ids.artist}/status`).set(as('admin-token')).send({ is_active: false }).expect(200);
  });

  it('supports seller profile edits and the admin verification workflow', async () => {
    await request(app.getHttpServer()).put(`/api/identity/seller-profiles/${ids.profile}`).set(as('artist-token')).send({ bio: 'Artist bio', websiteUrl: 'https://artist.test' }).expect(200);
    await request(app.getHttpServer()).put(`/api/identity/seller-profiles/${ids.profile}/visibility`).set(as('artist-token')).send({ isVisible: true }).expect(200);
    await request(app.getHttpServer()).put(`/api/identity/seller-profiles/${ids.profile}/verify-request`).set(as('artist-token')).expect(200);
    await request(app.getHttpServer()).get('/api/admin/verify-requests?page=2&limit=5').set(as('admin-token')).expect(200);
    expect(mocks.sellerProfiles.getPendingRequests).toHaveBeenLastCalledWith('2', '5');
    await request(app.getHttpServer()).post(`/api/admin/verify-requests/${ids.profile}/approve`).set(as('admin-token')).expect(201);
    await request(app.getHttpServer()).post(`/api/admin/verify-requests/${ids.profile}/reject`).set(as('admin-token')).expect(201);
  });
});
