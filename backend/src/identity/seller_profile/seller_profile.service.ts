import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SellerProfile } from './entities/seller_profile.entity';
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
}
