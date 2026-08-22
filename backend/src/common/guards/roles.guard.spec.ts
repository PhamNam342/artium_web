import { ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { UserRole } from '../../identity/user/entities/user.entity';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  const contextFor = (role?: UserRole) => ({
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows an artist when the route requires the artist role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ARTIST]);

    expect(guard.canActivate(contextFor(UserRole.ARTIST) as never)).toBe(true);
  });

  it('rejects a collector when the route requires the artist role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ARTIST]);

    expect(() => guard.canActivate(contextFor(UserRole.COLLECTOR) as never)).toThrow(
      ForbiddenException,
    );
  });

  it('allows routes without a role requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor() as never)).toBe(true);
  });
});
