import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    error: unknown,
    user: TUser | false | null,
    _info: unknown,
    context: ExecutionContext,
  ): TUser | undefined {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers.authorization) {
      return undefined;
    }

    if (error || !user) {
      throw error instanceof Error ? error : new UnauthorizedException();
    }

    return user;
  }
}
