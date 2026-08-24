import { Module } from '@nestjs/common';
import { FollowersModule } from './followers/followers.module';
import { ArtworkLikeModule } from './artwork/likes/artwork-like.module';
import { ArtworkCommentModule } from './artwork/comments/artwork-comment.module';
@Module({
  imports: [FollowersModule, ArtworkLikeModule, ArtworkCommentModule],
})
export class CommunityModule {}
