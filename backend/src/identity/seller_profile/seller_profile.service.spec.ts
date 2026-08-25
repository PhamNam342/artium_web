import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { SellerProfilesService } from './seller_profile.service';
import { SellerProfile, VerificationStatus } from './entities/seller_profile.entity';

describe('SellerProfilesService business rules', () => {
  const profile = { id: 'profile-id', userId: 'artist-id', bio: 'Bio', isVisible: true, verificationStatus: VerificationStatus.NONE } as SellerProfile;
  let repository: { findOne: jest.Mock; save: jest.Mock; update: jest.Mock };
  let service: SellerProfilesService;

  beforeEach(() => {
    repository = { findOne: jest.fn(), save: jest.fn(), update: jest.fn() };
    service = new SellerProfilesService(repository as unknown as Repository<SellerProfile>);
  });

  it('prevents a different user from editing a seller profile', async () => {
    repository.findOne.mockResolvedValue(profile);

    await expect(service.update(profile.id, 'other-user', { bio: 'Changed' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it.each([VerificationStatus.PENDING, VerificationStatus.APPROVED])('does not allow a %s verification request to be resubmitted', async (verificationStatus) => {
    repository.findOne.mockResolvedValue({ ...profile, verificationStatus });

    await expect(service.requestVerification(profile.id, profile.userId)).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
