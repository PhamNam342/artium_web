import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../user/entities/user.entity';
import { SellerProfile } from '../seller_profile/entities/seller_profile.entity';

describe('AuthService business rules', () => {
  const user = { id: 'user-id', email: 'artist@example.test', role: null, is_active: true } as User;
  let users: { findOneBy: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    users = { findOneBy: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    service = new AuthService(
      users as unknown as Repository<User>,
      { create: jest.fn(), save: jest.fn() } as unknown as Repository<SellerProfile>,
      { sign: jest.fn(() => 'token') } as unknown as JwtService,
      { getOrThrow: jest.fn(() => 'google-client-id') } as never,
      { get: jest.fn(), set: jest.fn(), del: jest.fn() } as never,
      { sendOtp: jest.fn() } as never,
      { set: jest.fn() } as never,
    );
  });

  it('rejects registration for an existing email', async () => {
    users.findOneBy.mockResolvedValue(user);

    await expect(service.initiateRegister(user.email, 'password1')).rejects.toMatchObject<HttpException>({ status: HttpStatus.CONFLICT });
  });

  it('requires a bio when an artist completes a profile', async () => {
    users.findOne.mockResolvedValue(user);

    await expect(service.completeProfile(user.id, { role: UserRole.ARTIST, full_name: 'Artist', location: 'HCM' })).rejects.toMatchObject<HttpException>({ status: HttpStatus.BAD_REQUEST });
    expect(users.save).not.toHaveBeenCalled();
  });

  it('rejects password login for a disabled account', async () => {
    users.findOneBy.mockResolvedValue({ ...user, password: 'hash', is_active: false });

    await expect(service.login(user.email, 'password1')).rejects.toMatchObject<HttpException>({ status: HttpStatus.FORBIDDEN });
  });
});
