import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { SellerProfile } from '../seller_profile/entities/seller_profile.entity';
import { UserRole } from './entities/user.entity';
import { t } from '../../common/utils/i18n.util';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepository: Repository<SellerProfile>,
  ) {}

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
          }
        : null,
    };
  }
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
            }
          : null,
    };
  }
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

  // =========================
  // Admin Endpoints
  // =========================

  async findAllUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminUserDetail(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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

  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(t('user.user_not_found'));
    }

    user.is_active = isActive;
    await this.userRepository.save(user);

    return {
      message: isActive ? 'Tài khoản đã được kích hoạt' : 'Tài khoản đã bị vô hiệu hóa',
      user: {
        id: user.id,
        is_active: user.is_active,
      },
    };
  }
}
