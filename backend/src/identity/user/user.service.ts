import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { SellerProfile } from '../seller_profile/entities/seller_profile.entity';
import { UserRole } from './entities/user.entity';
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
      throw new NotFoundException('User not found');
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
      throw new NotFoundException('User not found');
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
      throw new NotFoundException('User not found');
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
}
