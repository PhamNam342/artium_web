import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { t } from '../../common/utils/i18n.util';
import { UserRole } from '../../user/entities/user.entity';
import type { RequestWithUser } from './interfaces/request-with-user.interface';

@Injectable()
export class ArtistRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.user?.role !== UserRole.ARTIST) {
      throw new ForbiddenException(t('auth.artist_role_required'));
    }

    return true;
  }
}
