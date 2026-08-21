import { UserRole } from '../../user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  full_name: string;
  role: UserRole;
  jti: string;
  iat?: number;
  exp?: number;
}
