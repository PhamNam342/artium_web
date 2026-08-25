import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
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

export const ids = {
  artist: '11111111-1111-4111-8111-111111111111',
  collector: '22222222-2222-4222-8222-222222222222',
  admin: '33333333-3333-4333-8333-333333333333',
  artwork: '44444444-4444-4444-8444-444444444444',
  folder: '55555555-5555-4555-8555-555555555555',
  profile: '66666666-6666-4666-8666-666666666666',
  order: '77777777-7777-4777-8777-777777777777',
} as const;

const users = {
  'artist-token': { id: ids.artist, sub: ids.artist, email: 'artist@test.local', role: UserRole.ARTIST },
  'collector-token': { id: ids.collector, sub: ids.collector, email: 'collector@test.local', role: UserRole.COLLECTOR },
  'admin-token': { id: ids.admin, sub: ids.admin, email: 'admin@test.local', role: UserRole.ADMIN },
} as const;

export const as = (token: keyof typeof users) => ({
  Authorization: `Bearer ${token}`,
});

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
    const roles = Reflect.getMetadata(ROLES_KEY, context.getHandler()) ?? Reflect.getMetadata(ROLES_KEY, context.getClass());
    if (!roles) return true;
    const user = context.switchToHttp().getRequest<{ user?: { role: UserRole } }>().user;
    return Boolean(user && roles.includes(user.role));
  }
}

/** Shared API harness; external infrastructure is mocked at the service boundary. */
export async function createE2eApp() {
  const appService = { getHello: jest.fn(() => 'Hello World!') };
  const auth = {
    initiateRegister: jest.fn(), completeRegister: jest.fn(() => 'access-token'), login: jest.fn(() => 'access-token'), loginWithGoogle: jest.fn(() => 'google-token'),
    logout: jest.fn(), completeProfile: jest.fn(() => 'profile-token'), forgotPassword: jest.fn(), verifyForgotPassword: jest.fn(() => 'reset-token'), resetPassword: jest.fn(), changePassword: jest.fn(),
  };
  const usersService = {
    getAdminDashboardStats: jest.fn(() => ({ totalUsers: 3 })), findAllUsers: jest.fn(() => ({ data: [], meta: { page: 1 } })), getAdminUserDetail: jest.fn(() => ({ id: ids.artist })),
    toggleUserStatus: jest.fn(() => ({ is_active: false })), findById: jest.fn(() => ({ id: ids.artist })), findPublicArtists: jest.fn(() => []), findPublicProfile: jest.fn(() => ({ id: ids.artist })),
    updateProfile: jest.fn(() => ({ id: ids.artist })), updateAvatar: jest.fn(() => ({ id: ids.artist })), deactivateAccount: jest.fn(() => ({ is_active: false })),
  };
  const artworks = {
    findAll: jest.fn(() => ({ data: [], meta: { page: 1 } })), adminFindAll: jest.fn(() => ({ data: [], meta: { page: 1 } })), findMine: jest.fn(() => ({ data: [], meta: { page: 1 } })),
    findTags: jest.fn(() => []), createTag: jest.fn(() => ({ id: 'tag-1' })), bulkMove: jest.fn(() => ({ movedCount: 1 })), findOne: jest.fn(() => ({ id: ids.artwork })),
    create: jest.fn(() => ({ id: ids.artwork })), update: jest.fn(() => ({ id: ids.artwork })), adminRemove: jest.fn(() => ({ id: ids.artwork, deleted: true })), remove: jest.fn(() => ({ id: ids.artwork, deleted: true })),
    updateStatus: jest.fn(() => ({ id: ids.artwork, status: 'ACTIVE' })), updatePublish: jest.fn(() => ({ id: ids.artwork, isPublished: true })),
  };
  const folders = {
    create: jest.fn(() => ({ id: ids.folder })), findTree: jest.fn(() => []), findOne: jest.fn(() => ({ id: ids.folder })), update: jest.fn(() => ({ id: ids.folder })),
    listArtworks: jest.fn(() => ({ data: [], meta: {} })), move: jest.fn(() => ({ id: ids.folder })), remove: jest.fn(() => ({ id: ids.folder, deleted: true })),
  };
  const sellerProfiles = {
    update: jest.fn(() => ({ id: ids.profile })), updateVisibility: jest.fn(() => ({ id: ids.profile, isVisible: true })), requestVerification: jest.fn(() => ({ id: ids.profile })),
    getPendingRequests: jest.fn(() => ({ data: [], meta: {} })), approveVerification: jest.fn(() => ({ id: ids.profile })), rejectVerification: jest.fn(() => ({ id: ids.profile })),
  };
  const comments = { create: jest.fn(() => ({ id: 'comment-1' })), findAll: jest.fn(() => []), count: jest.fn(() => 1), update: jest.fn(() => ({ id: 'comment-1' })), remove: jest.fn(() => ({ id: 'comment-1', deleted: true })) };
  const likes = { like: jest.fn(() => ({ id: 'like-1' })), unlike: jest.fn(() => ({ deleted: true })), getLikes: jest.fn(() => []), isLiked: jest.fn(() => true), countLikes: jest.fn(() => 1) };
  const followers = { follow: jest.fn(() => ({ followerId: ids.collector })), unfollow: jest.fn(() => ({ deleted: true })), getCounts: jest.fn(() => ({ followers: 1, following: 2 })), getFollowers: jest.fn(() => []), getFollowing: jest.fn(() => []), getStatus: jest.fn(() => ({ isFollowing: true })) };
  const item = { id: 'notification-1', type: 'FOLLOW', entityType: 'USER', isRead: false, createdAt: new Date() };
  const notifications = { findAll: jest.fn(() => []), countUnread: jest.fn(() => 1), markAllAsRead: jest.fn(() => ({ updated: 1 })), findById: jest.fn(() => item), markAsRead: jest.fn(() => ({ ...item, isRead: true })), create: jest.fn(() => ({ id: item.id })) };
  const orders = { createOrder: jest.fn(() => ({ id: ids.order })), createPaymentLink: jest.fn(() => ({ checkoutUrl: 'https://pay.test/checkout' })), cancelPayment: jest.fn(() => ({ id: ids.order })), getUserOrders: jest.fn(() => []), getOrderById: jest.fn(() => ({ id: ids.order })), updateOrderStatus: jest.fn(() => ({ id: ids.order, status: 'SHIPPED' })), handlePayOSWebhook: jest.fn() };
  const uploads = { uploadArtworkImages: jest.fn(() => [{ url: 'http://test.local/uploads/image.jpg' }]), uploadAvatar: jest.fn(() => 'http://test.local/uploads/avatar.jpg') };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [AppController, AuthController, UserController, SellerProfilesController, AdminSellerProfilesController, ArtworksController, ArtworkFoldersController, ArtworkCommentController, ArtworkLikeController, FollowersController, NotificationController, OrdersController, PaymentsController, UploadController],
    providers: [
      { provide: AppService, useValue: appService }, { provide: AuthService, useValue: auth }, { provide: UserService, useValue: usersService }, { provide: ArtworksService, useValue: artworks }, { provide: ArtworkFoldersService, useValue: folders }, { provide: SellerProfilesService, useValue: sellerProfiles },
      { provide: ArtworkCommentService, useValue: comments }, { provide: ArtworkLikeService, useValue: likes }, { provide: FollowersService, useValue: followers }, { provide: NotificationService, useValue: notifications }, { provide: OrdersService, useValue: orders }, { provide: UploadService, useValue: uploads },
      { provide: ConfigService, useValue: { getOrThrow: jest.fn(() => 'http://test.local') } }, { provide: JwtAuthGuard, useClass: TestJwtAuthGuard }, { provide: OptionalJwtAuthGuard, useClass: TestOptionalJwtAuthGuard }, { provide: RolesGuard, useClass: TestRolesGuard },
    ],
  }).overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard).overrideGuard(OptionalJwtAuthGuard).useClass(TestOptionalJwtAuthGuard).overrideGuard(RolesGuard).useClass(TestRolesGuard).compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return { app, mocks: { appService, auth, users: usersService, artworks, folders, sellerProfiles, comments, likes, followers, notifications, orders, uploads } };
}
