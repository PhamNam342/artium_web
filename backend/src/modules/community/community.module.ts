import { Module } from '@nestjs/common';
import { FollowersModule } from './followers/followers.module';

@Module({
  imports: [FollowersModule],
})
export class CommunityModule {}
