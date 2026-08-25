import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { ROLES_KEY } from '../src/common/decorators/roles.decorator';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { AuthController } from '../src/identity/auth/auth.controller';
import { JwtAuthGuard } from '../src/identity/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../src/identity/auth/optional-jwt-auth.guard';
import { AuthService } from '../src/identity/auth/auth.service';
import { AdminSellerProfilesController } from '../src/identity/seller_profile/admin-seller-profile.controller';
import { SellerProfilesController } from '../src/identity/seller_profile/seller_profile.controller';
import { SellerProfilesService } from '../src/identity/seller_profile/seller_profile.service';
import { UserController } from '../src/identity/user/user.controller';
import { UserRole } from '../src/identity/user/entities/user.entity';
import { UserService } from '../src/identity/user/user.service';
import { ArtworkFoldersController } from '../src/modules/artwork-folders/artwork-folders.controller';
import { ArtworkFoldersService } from '../src/modules/artwork-folders/artwork-folders.service';
import { ArtworksController } from '../src/modules/artworks/artworks.controller';
import { ArtworksService } from '../src/modules/artworks/artworks.service';
import { ArtworkCommentController } from '../src/modules/community/artwork/comments/artwork-comment.controller';
import { ArtworkCommentService } from '../src/modules/community/artwork/comments/artwork-comment.service';
import { ArtworkLikeController } from '../src/modules/community/artwork/likes/artwork-like.controller';
import { ArtworkLikeService } from '../src/modules/community/artwork/likes/artwork-like.service';
import { FollowersController } from '../src/modules/community/followers/followers.controller';
import { FollowersService } from '../src/modules/community/followers/followers.service';
import { NotificationController } from '../src/modules/notification/notification.controller';
import { NotificationService } from '../src/modules/notification/notification.service';
import { OrdersController } from '../src/modules/orders/orders.controller';
import { OrdersService } from '../src/modules/orders/orders.service';
import { PaymentsController } from '../src/modules/payments/payments.controller';
import { UploadController } from '../src/modules/upload/upload.controller';
import { UploadService } from '../src/modules/upload/upload.service';

const artistId = '11111111-1111-4111-8111-111111111111';
const collectorId = '22222222-2222-4222-8222-222222222222';
const adminId = '33333333-3333-4333-8333-333333333333';
const artworkId = '44444444-4444-4444-8444-444444444444';
const folderId = '55555555-5555-4555-8555-555555555555';
const profileId = '66666666-6666-4666-8666-666666666666';
const orderId = '77777777-7777-4777-8777-777777777777';

const users = {
  'artist-token': { id: artistId, sub: artistId, email: 'artist@test.local', role: UserRole.ARTIST },
  'collector-token': { id: collectorId, sub: collectorId, email: 'collector@test.local', role: UserRole.COLLECTOR },
  'admin-token': { id: adminId, sub: adminId, email: 'admin@test.local', role: UserRole.ADMIN },
} as const;

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = req.headers.authorization?.replace(/^Bearer\s+/, '');
    const user = token ? users[token as keyof typeof users] : undefined;
    if (!user) throw new UnauthorizedException();
    req.user = user;
    return true;
  }
}

class TestOptionalJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = req.headers.authorization?.replace(/^Bearer\s+/, '');
    const user = token ? users[token as keyof typeof users] : undefined;
    if (token && !user) throw new UnauthorizedException();
    req.user = user;
    return true;
  }
}

class TestRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const roles =
      Reflect.getMetadata(ROLES_KEY, context.getHandler()) ??
      Reflect.getMetadata(ROLES_KEY, context.getClass());
    if (!roles) return true;
    const user = context.switchToHttp().getRequest<{ user?: { role: UserRole } }>().user;
    return Boolean(user && roles.includes(user.role));
  }
}

/**
 * HTTP contract E2E suite. Database, Redis, email, payment and storage adapters
 * are mocked only at their service boundary. Routes, guards, DTO pipes and
 * controller-to-service contracts run exactly as they do in the API.
 */
describe('Artium API (e2e)', () => {
  let app: INestApplication<App>;
  const appService = { getHello: jest.fn(() => 'Hello World!') };
  const authService = {
    initiateRegister: jest.fn(), completeRegister: jest.fn(() => 'access-token'), login: jest.fn(() => 'access-token'),
    loginWithGoogle: jest.fn(() => 'google-token'), logout: jest.fn(), completeProfile: jest.fn(() => 'profile-token'),
    forgotPassword: jest.fn(), verifyForgotPassword: jest.fn(() => 'reset-token'), resetPassword: jest.fn(), changePassword: jest.fn(),
  };
  const userService = {
    getAdminDashboardStats: jest.fn(() => ({ totalUsers: 3 })), findAllUsers: jest.fn(() => ({ data: [], meta: { page: 1 } })),
    getAdminUserDetail: jest.fn(() => ({ id: artistId })), toggleUserStatus: jest.fn(() => ({ is_active: false })),
    findById: jest.fn(() => ({ id: artistId })), findPublicArtists: jest.fn(() => []), findPublicProfile: jest.fn(() => ({ id: artistId })),
    updateProfile: jest.fn(() => ({ id: artistId })), updateAvatar: jest.fn(() => ({ id: artistId })), deactivateAccount: jest.fn(() => ({ is_active: false })),
  };
  const artworksService = {
    findAll: jest.fn(() => ({ data: [], meta: { page: 1 } })), adminFindAll: jest.fn(() => ({ data: [], meta: { page: 1 } })),
    findMine: jest.fn(() => ({ data: [], meta: { page: 1 } })), findTags: jest.fn(() => []), createTag: jest.fn(() => ({ id: 'tag-1' })),
    bulkMove: jest.fn(() => ({ movedCount: 1 })), findOne: jest.fn(() => ({ id: artworkId })), create: jest.fn(() => ({ id: artworkId })),
    update: jest.fn(() => ({ id: artworkId })), adminRemove: jest.fn(() => ({ id: artworkId, deleted: true })), remove: jest.fn(() => ({ id: artworkId, deleted: true })),
    updateStatus: jest.fn(() => ({ id: artworkId, status: 'ACTIVE' })), updatePublish: jest.fn(() => ({ id: artworkId, isPublished: true })),
  };
  const foldersService = {
    create: jest.fn(() => ({ id: folderId })), findTree: jest.fn(() => []), findOne: jest.fn(() => ({ id: folderId })), update: jest.fn(() => ({ id: folderId })),
    listArtworks: jest.fn(() => ({ data: [], meta: {} })), move: jest.fn(() => ({ id: folderId })), remove: jest.fn(() => ({ id: folderId, deleted: true })),
  };
  const sellerProfilesService = {
    update: jest.fn(() => ({ id: profileId })), updateVisibility: jest.fn(() => ({ id: profileId, isVisible: true })), requestVerification: jest.fn(() => ({ id: profileId })),
    getPendingRequests: jest.fn(() => ({ data: [], meta: {} })), approveVerification: jest.fn(() => ({ id: profileId })), rejectVerification: jest.fn(() => ({ id: profileId })),
  };
  const commentsService = { create: jest.fn(() => ({ id: 'comment-1' })), findAll: jest.fn(() => []), count: jest.fn(() => 1), update: jest.fn(() => ({ id: 'comment-1' })), remove: jest.fn(() => ({ id: 'comment-1', deleted: true })) };
  const likesService = { like: jest.fn(() => ({ id: 'like-1' })), unlike: jest.fn(() => ({ deleted: true })), getLikes: jest.fn(() => []), isLiked: jest.fn(() => true), countLikes: jest.fn(() => 1) };
  const followersService = { follow: jest.fn(() => ({ followerId: collectorId })), unfollow: jest.fn(() => ({ deleted: true })), getCounts: jest.fn(() => ({ followers: 1, following: 2 })), getFollowers: jest.fn(() => []), getFollowing: jest.fn(() => []), getStatus: jest.fn(() => ({ isFollowing: true })) };
  const notification = { id: 'notification-1', type: 'FOLLOW', entityType: 'USER', isRead: false, createdAt: new Date() };
  const notificationService = { findAll: jest.fn(() => []), countUnread: jest.fn(() => 1), markAllAsRead: jest.fn(() => ({ updated: 1 })), findById: jest.fn(() => notification), markAsRead: jest.fn(() => ({ ...notification, isRead: true })), create: jest.fn(() => ({ id: notification.id })) };
  const ordersService = { createOrder: jest.fn(() => ({ id: orderId })), createPaymentLink: jest.fn(() => ({ checkoutUrl: 'https://pay.test/checkout' })), cancelPayment: jest.fn(() => ({ id: orderId })), getUserOrders: jest.fn(() => []), getOrderById: jest.fn(() => ({ id: orderId })), updateOrderStatus: jest.fn(() => ({ id: orderId, status: 'SHIPPED' })), handlePayOSWebhook: jest.fn() };
  const uploadService = { uploadArtworkImages: jest.fn(() => [{ url: 'http://test.local/uploads/image.jpg' }]), uploadAvatar: jest.fn(() => 'http://test.local/uploads/avatar.jpg') };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, AuthController, UserController, SellerProfilesController, AdminSellerProfilesController, ArtworksController, ArtworkFoldersController, ArtworkCommentController, ArtworkLikeController, FollowersController, NotificationController, OrdersController, PaymentsController, UploadController],
      providers: [
        { provide: AppService, useValue: appService }, { provide: AuthService, useValue: authService }, { provide: UserService, useValue: userService }, { provide: ArtworksService, useValue: artworksService }, { provide: ArtworkFoldersService, useValue: foldersService }, { provide: SellerProfilesService, useValue: sellerProfilesService },
        { provide: ArtworkCommentService, useValue: commentsService }, { provide: ArtworkLikeService, useValue: likesService }, { provide: FollowersService, useValue: followersService }, { provide: NotificationService, useValue: notificationService }, { provide: OrdersService, useValue: ordersService }, { provide: UploadService, useValue: uploadService },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn(() => 'http://test.local') } }, { provide: JwtAuthGuard, useClass: TestJwtAuthGuard }, { provide: OptionalJwtAuthGuard, useClass: TestOptionalJwtAuthGuard }, { provide: RolesGuard, useClass: TestRolesGuard },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)
      .overrideGuard(OptionalJwtAuthGuard)
      .useClass(TestOptionalJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(TestRolesGuard)
      .compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app.close());
  const as = (token: keyof typeof users) => ({ Authorization: `Bearer ${token}` });

  it('uses the production API prefix', async () => {
    await request(app.getHttpServer()).get('/api').expect(200).expect('Hello World!');
  });

  describe('authentication and user accounts', () => {
    it('covers registration, login, recovery, logout and profile completion', async () => {
      await request(app.getHttpServer()).post('/api/auth/register/initiate').send({ email: 'invalid', password: 'short' }).expect(400);
      await request(app.getHttpServer()).post('/api/auth/register/initiate').send({ email: 'new@test.local', password: 'secret1' }).expect(200);
      expect(authService.initiateRegister).toHaveBeenLastCalledWith('new@test.local', 'secret1');
      await request(app.getHttpServer()).post('/api/auth/register/complete').send({ email: 'new@test.local', otp: '123456', name: 'New User' }).expect(201, { access_token: 'access-token' });
      await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'new@test.local', password: 'secret1' }).expect(200, { access_token: 'access-token' });
      await request(app.getHttpServer()).post('/api/auth/google').send({ idToken: 'google-token' }).expect(200, { access_token: 'google-token' });
      await request(app.getHttpServer()).post('/api/auth/forgot-password').send({ email: 'new@test.local' }).expect(200);
      await request(app.getHttpServer()).post('/api/auth/forgot-password/verify').send({ email: 'new@test.local', otp: '123456' }).expect(200, { reset_token: 'reset-token' });
      await request(app.getHttpServer()).post('/api/auth/forgot-password/reset').send({ resetToken: 'reset-token', newPassword: 'new-secret' }).expect(200);
      await request(app.getHttpServer()).patch('/api/auth/profile/complete').set(as('artist-token')).send({ role: 'ARTIST', full_name: 'Artist', location: 'HCM' }).expect(200, { access_token: 'profile-token' });
      await request(app.getHttpServer()).patch('/api/auth/change-password').set(as('artist-token')).send({ currentPassword: 'secret1', newPassword: 'new-secret' }).expect(200);
      await request(app.getHttpServer()).post('/api/auth/logout').set(as('artist-token')).expect(200);
      expect(authService.logout).toHaveBeenLastCalledWith('artist-token');
    });

    it('enforces auth and roles on user and seller APIs', async () => {
      await request(app.getHttpServer()).get('/api/identity/users/me').expect(401);
      await request(app.getHttpServer()).get('/api/identity/users/artists').expect(200, []);
      await request(app.getHttpServer()).get(`/api/identity/users/${artistId}`).expect(200, { id: artistId });
      await request(app.getHttpServer()).get('/api/identity/users/me').set(as('artist-token')).expect(200, { id: artistId });
      await request(app.getHttpServer()).patch('/api/identity/users/profile').set(as('artist-token')).send({ full_name: 'Renamed' }).expect(200);
      await request(app.getHttpServer()).post('/api/identity/users/avatar').set(as('artist-token')).attach('file', Buffer.from('avatar'), 'avatar.jpg').expect(201);
      expect(uploadService.uploadAvatar).toHaveBeenLastCalledWith(expect.any(Object), artistId, 'http://test.local');
      await request(app.getHttpServer()).delete('/api/identity/users/me').set(as('artist-token')).expect(200);
      await request(app.getHttpServer()).get('/api/identity/users/admin/dashboard').set(as('artist-token')).expect(403);
      await request(app.getHttpServer()).get('/api/identity/users/admin/dashboard').set(as('admin-token')).expect(200, { totalUsers: 3 });
      await request(app.getHttpServer()).get('/api/identity/users/admin/list?page=2&limit=200&search=artist&isActive=false').set(as('admin-token')).expect(200);
      expect(userService.findAllUsers).toHaveBeenLastCalledWith(2, 100, 'artist', false);
      await request(app.getHttpServer()).get(`/api/identity/users/admin/${artistId}`).set(as('admin-token')).expect(200);
      await request(app.getHttpServer()).patch(`/api/identity/users/admin/${artistId}/status`).set(as('admin-token')).send({ is_active: false }).expect(200);
      await request(app.getHttpServer()).put(`/api/identity/seller-profiles/${profileId}`).set(as('artist-token')).send({ bio: 'Artist bio', websiteUrl: 'https://artist.test' }).expect(200);
      await request(app.getHttpServer()).put(`/api/identity/seller-profiles/${profileId}/visibility`).set(as('artist-token')).send({ isVisible: true }).expect(200);
      await request(app.getHttpServer()).put(`/api/identity/seller-profiles/${profileId}/verify-request`).set(as('artist-token')).expect(200);
      await request(app.getHttpServer()).get('/api/admin/verify-requests?page=2&limit=5').set(as('admin-token')).expect(200);
      expect(sellerProfilesService.getPendingRequests).toHaveBeenLastCalledWith('2', '5');
      await request(app.getHttpServer()).post(`/api/admin/verify-requests/${profileId}/approve`).set(as('admin-token')).expect(201);
      await request(app.getHttpServer()).post(`/api/admin/verify-requests/${profileId}/reject`).set(as('admin-token')).expect(201);
    });
  });

  describe('artwork catalogue, uploads and folders', () => {
    it('covers public discovery and the artist management lifecycle', async () => {
      await request(app.getHttpServer()).get(`/api/artworks?sellerId=${artistId}&search=sun`).expect(200);
      await request(app.getHttpServer()).get('/api/artwork/tags').expect(200, []);
      await request(app.getHttpServer()).get(`/api/artwork/${artworkId}`).expect(200, { id: artworkId });
      expect(artworksService.findOne).toHaveBeenLastCalledWith(artworkId, undefined);
      await request(app.getHttpServer()).get('/api/artworks/mine?page=1').set(as('artist-token')).expect(200);
      await request(app.getHttpServer()).post('/api/artworks/tags').set(as('artist-token')).send({ name: 'Abstract' }).expect(201);
      await request(app.getHttpServer()).post('/api/artworks').set(as('collector-token')).send({ title: 'Denied' }).expect(403);
      await request(app.getHttpServer()).post('/api/artworks').set(as('artist-token')).send({ title: '' }).expect(400);
      await request(app.getHttpServer()).post('/api/artworks').set(as('artist-token')).send({ title: 'Sunrise', price: 1000000, images: [{ url: 'https://image.test/sunrise.jpg' }] }).expect(201);
      expect(artworksService.create).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Sunrise', price: 1000000 }), artistId);
      await request(app.getHttpServer()).put(`/api/artworks/${artworkId}`).set(as('artist-token')).send({ title: 'Morning' }).expect(200);
      await request(app.getHttpServer()).patch(`/api/artworks/${artworkId}`).set(as('artist-token')).send({ description: 'Updated' }).expect(200);
      await request(app.getHttpServer()).patch(`/api/artworks/${artworkId}/status`).set(as('artist-token')).send({ status: 'ACTIVE' }).expect(200);
      await request(app.getHttpServer()).patch(`/api/artworks/${artworkId}/publish`).set(as('artist-token')).send({ isPublished: true }).expect(200);
      await request(app.getHttpServer()).post('/api/artworks/bulk/move').set(as('artist-token')).send({ artworkIds: [artworkId], folderId }).expect(201, { movedCount: 1 });
      await request(app.getHttpServer()).delete(`/api/artworks/${artworkId}`).set(as('artist-token')).expect(200);
      await request(app.getHttpServer()).get('/api/artworks/admin/list').set(as('admin-token')).expect(200);
      await request(app.getHttpServer()).delete(`/api/artworks/admin/${artworkId}`).set(as('admin-token')).send({ reason: 'Policy violation' }).expect(200);
      expect(artworksService.adminRemove).toHaveBeenLastCalledWith(artworkId, adminId, 'Policy violation');
    });

    it('covers artwork file upload and the folder tree lifecycle', async () => {
      await request(app.getHttpServer()).post('/api/upload/artwork-images').set(as('artist-token')).field('artworkId', artworkId).attach('files', Buffer.from('image'), 'image.jpg').expect(201);
      expect(uploadService.uploadArtworkImages).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ artworkId }), artistId, expect.stringContaining('http://'));
      await request(app.getHttpServer()).post(`/api/sellers/${collectorId}/artwork-folders`).set(as('artist-token')).send({ name: 'Private' }).expect(403);
      await request(app.getHttpServer()).post(`/api/sellers/${artistId}/artwork-folders`).set(as('artist-token')).send({ name: 'Portfolio' }).expect(201);
      await request(app.getHttpServer()).get(`/api/sellers/${artistId}/artwork-folders/tree`).set(as('artist-token')).expect(200, []);
      await request(app.getHttpServer()).get(`/api/artwork-folders/${folderId}`).set(as('artist-token')).expect(200);
      await request(app.getHttpServer()).patch(`/api/artwork-folders/${folderId}`).set(as('artist-token')).send({ isVisible: true }).expect(200);
      await request(app.getHttpServer()).get(`/api/artwork-folders/${folderId}/artworks?page=1&limit=10`).set(as('artist-token')).expect(200);
      await request(app.getHttpServer()).patch(`/api/artwork-folders/${folderId}/move`).set(as('artist-token')).send({ parentId: null }).expect(200);
      await request(app.getHttpServer()).delete(`/api/artwork-folders/${folderId}`).set(as('artist-token')).expect(200);
    });
  });

  describe('community, notifications, orders and payments', () => {
    it('covers follower, like and comment interaction routes', async () => {
      await request(app.getHttpServer()).post(`/api/community/followers/${artistId}`).set(as('collector-token')).expect(201);
      expect(followersService.follow).toHaveBeenLastCalledWith(collectorId, artistId);
      await request(app.getHttpServer()).get(`/api/community/followers/counts/${artistId}`).expect(200, { followers: 1, following: 2 });
      await request(app.getHttpServer()).get(`/api/community/followers/followers/${artistId}?skip=0&take=20`).expect(200, []);
      await request(app.getHttpServer()).get(`/api/community/followers/following/${artistId}`).expect(200, []);
      await request(app.getHttpServer()).get(`/api/community/followers/status/${artistId}`).set(as('collector-token')).expect(200, { isFollowing: true });
      await request(app.getHttpServer()).delete(`/api/community/followers/${artistId}`).set(as('collector-token')).expect(200);
      await request(app.getHttpServer()).post(`/api/community/artworks/${artworkId}/like`).set(as('collector-token')).expect(201);
      await request(app.getHttpServer()).get(`/api/community/artworks/${artworkId}/likes`).expect(200, []);
      await request(app.getHttpServer()).get(`/api/community/artworks/${artworkId}/like/status`).set(as('collector-token')).expect(200, { isLiked: true });
      await request(app.getHttpServer()).get(`/api/community/artworks/${artworkId}/like/count`).expect(200, { count: 1 });
      await request(app.getHttpServer()).delete(`/api/community/artworks/${artworkId}/like`).set(as('collector-token')).expect(200);
      await request(app.getHttpServer()).post(`/api/community/artworks/${artworkId}/comments`).set(as('collector-token')).send({ content: 'Beautiful work' }).expect(201);
      await request(app.getHttpServer()).post(`/api/community/artworks/${artworkId}/comments`).set(as('collector-token')).send({ content: '' }).expect(400);
      await request(app.getHttpServer()).get(`/api/community/artworks/${artworkId}/comments`).expect(200, []);
      await request(app.getHttpServer()).get(`/api/community/artworks/${artworkId}/comments/count`).expect(200, { count: 1 });
      await request(app.getHttpServer()).patch(`/api/community/artworks/${artworkId}/comments/comment-1`).set(as('collector-token')).send({ content: 'Amazing work' }).expect(200);
      await request(app.getHttpServer()).delete(`/api/community/artworks/${artworkId}/comments/comment-1`).set(as('collector-token')).expect(200);
    });

    it('covers notifications plus order and PayOS endpoints', async () => {
      await request(app.getHttpServer()).get('/api/notifications').set(as('collector-token')).expect(200);
      await request(app.getHttpServer()).get('/api/notifications/unread-count').set(as('collector-token')).expect(200, { unreadCount: 1 });
      await request(app.getHttpServer()).get('/api/notifications/notification-1').set(as('collector-token')).expect(200);
      await request(app.getHttpServer()).put('/api/notifications/notification-1/read').set(as('collector-token')).expect(200);
      await request(app.getHttpServer()).put('/api/notifications/read-all').set(as('collector-token')).expect(200);
      await request(app.getHttpServer()).post('/api/notifications/test').set(as('collector-token')).expect(201);
      const shippingAddress = { fullName: 'Collector', addressLine1: '1 Art Street', city: 'Ho Chi Minh City', country: 'VN' };
      await request(app.getHttpServer()).post('/api/orders').set(as('collector-token')).send({ artworkId, shippingAddress }).expect(201, { id: orderId });
      expect(ordersService.createOrder).toHaveBeenLastCalledWith(collectorId, { artworkId, shippingAddress });
      await request(app.getHttpServer()).post('/api/orders').set(as('collector-token')).send({ artworkId }).expect(400);
      await request(app.getHttpServer()).get('/api/orders').set(as('collector-token')).expect(200, []);
      await request(app.getHttpServer()).get(`/api/orders/${orderId}`).set(as('collector-token')).expect(200, { id: orderId });
      await request(app.getHttpServer()).put(`/api/orders/${orderId}`).set(as('artist-token')).send({ status: 'SHIPPED' }).expect(200);
      await request(app.getHttpServer()).post(`/api/orders/${orderId}/payment`).set(as('collector-token')).expect(201);
      await request(app.getHttpServer()).post(`/api/orders/${orderId}/payment/cancel`).set(as('collector-token')).expect(201);
      await request(app.getHttpServer()).post('/api/payments/payos/webhook').send({ code: '00', data: { orderCode: 1 } }).expect(200, { success: true });
      expect(ordersService.handlePayOSWebhook).toHaveBeenCalledTimes(1);
    });
  });
});
