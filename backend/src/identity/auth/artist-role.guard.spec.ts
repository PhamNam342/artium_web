import { ForbiddenException } from '@nestjs/common';
import { ArtistRoleGuard } from './artist-role.guard';
import { UserRole } from '../../user/entities/user.entity';

describe('ArtistRoleGuard', () => {
  const guard = new ArtistRoleGuard();

  const contextFor = (role: UserRole | null) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
  });

  it('allows artists to manage artworks', () => {
    expect(guard.canActivate(contextFor(UserRole.ARTIST) as never)).toBe(true);
  });

  it('rejects collectors from managing artworks', () => {
    expect(() => guard.canActivate(contextFor(UserRole.COLLECTOR) as never)).toThrow(
      ForbiddenException,
    );
  });
});
