import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SellerProfile,
  VerificationStatus,
} from './entities/seller_profile.entity';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { t } from '../../common/utils/i18n.util';
@Injectable()
export class SellerProfilesService {
  constructor(
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepository: Repository<SellerProfile>,
  ) {}

  async findById(profileId: string): Promise<SellerProfile> {
    const profile = await this.sellerProfileRepository.findOne({
      where: {
        id: profileId,
      },
    });

    if (!profile) {
      throw new NotFoundException(t('seller_profile.not_found'));
    }

    return profile;
  }

  async update(
    profileId: string,
    userId: string,
    dto: UpdateSellerProfileDto,
  ): Promise<SellerProfile> {
    const profile = await this.findById(profileId);

    if (profile.userId !== userId) {
      throw new ForbiddenException(t('seller_profile.cannot_update'));
    }

    if (dto.bio !== undefined) {
      profile.bio = dto.bio;
    }

    if (dto.websiteUrl !== undefined) {
      profile.websiteUrl = dto.websiteUrl;
    }

    return this.sellerProfileRepository.save(profile);
  }

  async updateVisibility(
    profileId: string,
    userId: string,
    isVisible: boolean,
  ): Promise<SellerProfile> {
    const profile = await this.findById(profileId);

    if (profile.userId !== userId) {
      throw new ForbiddenException(t('seller_profile.cannot_update'));
    }

    profile.isVisible = isVisible;

    return this.sellerProfileRepository.save(profile);
  }

  async requestVerification(
    profileId: string,
    userId: string,
  ): Promise<SellerProfile> {
    const profile = await this.findById(profileId);

    if (profile.userId !== userId) {
      throw new ForbiddenException(t('seller_profile.cannot_update'));
    }

    if (
      profile.verificationStatus === VerificationStatus.PENDING ||
      profile.verificationStatus === VerificationStatus.APPROVED
    ) {
      throw new BadRequestException(
        'This verification request cannot be submitted again.',
      );
    }

    profile.verificationStatus = VerificationStatus.PENDING;

    return this.sellerProfileRepository.save(profile);
  }

  async getPendingRequests(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.sellerProfileRepository.findAndCount({
      where: {
        verificationStatus: VerificationStatus.PENDING,
      },
      relations: ['user'],
      skip,
      take: limit,
      order: {
        id: 'ASC', // you can order by created_at if added
      },
    });

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveVerification(profileId: string): Promise<SellerProfile> {
    const result = await this.sellerProfileRepository.update(
      {
        id: profileId,
        verificationStatus: VerificationStatus.PENDING,
      },
      {
        verificationStatus: VerificationStatus.APPROVED,
        isVerified: true,
      },
    );

    if (!result.affected) {
      await this.findById(profileId);
      throw new BadRequestException('Verification request is not pending.');
    }

    return this.findById(profileId);
  }

  async rejectVerification(profileId: string): Promise<SellerProfile> {
    const result = await this.sellerProfileRepository.update(
      {
        id: profileId,
        verificationStatus: VerificationStatus.PENDING,
      },
      {
        verificationStatus: VerificationStatus.REJECTED,
        isVerified: false,
      },
    );

    if (!result.affected) {
      await this.findById(profileId);
      throw new BadRequestException('Verification request is not pending.');
    }

    return this.findById(profileId);
  }
}
