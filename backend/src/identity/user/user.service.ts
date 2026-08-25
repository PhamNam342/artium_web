import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from './entities/user.entity';
import {
  SellerProfile,
  VerificationStatus,
} from '../seller_profile/entities/seller_profile.entity';
import { AuthService } from '../auth/auth.service';

import { t } from '../../common/utils/i18n.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepository: Repository<SellerProfile>,
    private readonly authService: AuthService,
  ) {}

  // =====================================================
  // Get Current User Profile
  // =====================================================

  async findById(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        sellerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      location: user.location,
      has_password: !!user.password,

      seller_profile: user.sellerProfile
        ? {
            id: user.sellerProfile.id,
            bio: user.sellerProfile.bio,
            website_url: user.sellerProfile.websiteUrl,
            is_visible: user.sellerProfile.isVisible,
            is_verified: user.sellerProfile.isVerified,
            verification_status: user.sellerProfile.verificationStatus,
          }
        : null,
    };
  }

  // =====================================================
  // Get Public Profile
  // =====================================================

  async findPublicProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        sellerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    return {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      location: user.location,

      seller_profile:
        user.role === UserRole.ARTIST && user.sellerProfile?.isVisible
          ? {
              bio: user.sellerProfile.bio,
              website_url: user.sellerProfile.websiteUrl,
              is_verified: user.sellerProfile.isVerified,
            }
          : null,
    };
  }

  async findPublicArtists() {
    const artists = await this.userRepository.find({
      where: {
        role: UserRole.ARTIST,
        is_active: true,
      },
      relations: {
        sellerProfile: true,
      },
      order: {
        full_name: 'ASC',
      },
    });

    return artists
      .filter((artist) => artist.sellerProfile?.isVisible)
      .map((artist) => ({
        id: artist.id,
        full_name: artist.full_name,
        role: artist.role,
        avatar_url: artist.avatar_url,
        location: artist.location,
        seller_profile: {
          bio: artist.sellerProfile!.bio,
          website_url: artist.sellerProfile!.websiteUrl,
          is_verified: artist.sellerProfile!.isVerified,
        },
      }));
  }

  // =====================================================
  // Update Profile
  // =====================================================

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        sellerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    // =========================
    // User profile
    // =========================

    if (dto.full_name !== undefined) {
      user.full_name = dto.full_name;
    }

    if (dto.location !== undefined) {
      user.location = dto.location;
    }

    await this.userRepository.save(user);

    // =========================
    // Artist profile
    // =========================

    if (user.role === UserRole.ARTIST) {
      let sellerProfile = user.sellerProfile;

      if (!sellerProfile) {
        sellerProfile = this.sellerProfileRepository.create({
          userId: user.id,
        });
      }

      if (dto.bio !== undefined) {
        sellerProfile.bio = dto.bio;
      }

      await this.sellerProfileRepository.save(sellerProfile);
    }

    return this.findById(userId);
  }

  // =====================================================
  // Update Avatar
  // =====================================================

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    user.avatar_url = avatarUrl;

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      avatar_url: updatedUser.avatar_url,
      location: updatedUser.location,
    };
  }

  // =====================================================
  // Deactivate Current User Account
  // =====================================================

  async deactivateAccount(userId: string, accessToken?: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException(
        'Administrators cannot deactivate their own account.',
      );
    }

    await this.authService.logout(accessToken);

    user.is_active = false;

    await this.userRepository.save(user);

    return {
      message: t('user.account_deleted'),
    };
  }

  // =====================================================
  // Admin Endpoints
  // =====================================================

  async findAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      query.andWhere(
        '(user.full_name ILIKE :search OR user.email ILIKE :search)',
        {
          search: `%${normalizedSearch}%`,
        },
      );
    }

    if (isActive !== undefined) {
      query.andWhere('user.is_active = :isActive', {
        isActive,
      });
    }

    const [users, total] = await query.getManyAndCount();

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      })),

      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // =====================================================
  // Admin User Detail
  // =====================================================

  async getAdminUserDetail(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        sellerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      location: user.location,
      is_active: user.is_active,
      created_at: user.created_at,

      seller_profile: user.sellerProfile
        ? {
            id: user.sellerProfile.id,
            bio: user.sellerProfile.bio,
            website_url: user.sellerProfile.websiteUrl,
            is_visible: user.sellerProfile.isVisible,
            is_verified: user.sellerProfile.isVerified,
          }
        : null,
    };
  }

  // =====================================================
  // Admin Dashboard Stats
  // =====================================================

  async getAdminDashboardStats() {
    const [totalUsers, totalArtists, totalCollectors] = await Promise.all([
      this.userRepository.count(),

      this.userRepository.count({
        where: {
          role: UserRole.ARTIST,
        },
      }),

      this.userRepository.count({
        where: {
          role: UserRole.COLLECTOR,
        },
      }),
    ]);

    const totalPendingVerifications = await this.sellerProfileRepository.count({
      where: {
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    return {
      totalUsers,
      totalArtists,
      totalCollectors,
      totalPendingVerifications,
    };
  }

  // =====================================================
  // Admin Toggle User Status
  // =====================================================

  async toggleUserStatus(
    userId: string,
    isActive: boolean,
    actorUserId: string,
  ) {
    // Admin cannot deactivate their own account
    if (userId === actorUserId && !isActive) {
      throw new BadRequestException('You cannot disable your own account.');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    user.is_active = isActive;

    await this.userRepository.save(user);

    return {
      message: isActive
        ? 'Tài khoản đã được kích hoạt'
        : 'Tài khoản đã bị vô hiệu hóa',

      user: {
        id: user.id,
        is_active: user.is_active,
      },
    };
  }
}
