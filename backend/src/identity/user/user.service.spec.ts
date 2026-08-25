import { BadRequestException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { SellerProfile } from '../seller_profile/entities/seller_profile.entity';

describe('UserService admin safeguards', () => {
  it('does not allow an admin to deactivate their own account', async () => {
    const users = { findOne: jest.fn(), save: jest.fn() };
    const service = new UserService(
      users as unknown as Repository<User>,
      {} as Repository<SellerProfile>,
      {} as never,
    );

    await expect(service.toggleUserStatus('admin-id', false, 'admin-id')).rejects.toBeInstanceOf(BadRequestException);
    expect(users.findOne).not.toHaveBeenCalled();
  });
});
