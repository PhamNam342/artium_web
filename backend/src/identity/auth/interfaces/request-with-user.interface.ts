import { Request } from 'express';
import { UserRole } from '../../../user/entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole | null;
  };
}
