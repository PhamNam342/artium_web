import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FollowersController } from './followers.controller';
import { FollowersService } from './followers.service';
import { Follow } from './entities/follow.entity';
import { User } from '../../../identity/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User])],
  controllers: [FollowersController],
  providers: [FollowersService],
})
export class FollowersModule {}
