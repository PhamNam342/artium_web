import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Follow } from './entities/follow.entity';
import { User } from '../../../identity/user/entities/user.entity';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../notification/enums/notification-type.enum';
import { NotificationEntityType } from '../../notification/enums/notification-entity-type.enum';
@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async follow(followerId: string, followingId: string) {
    // 1. Không cho tự follow chính mình
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // 2. Kiểm tra user được follow có tồn tại không
    const followingUser = await this.userRepository.findOne({
      where: {
        id: followingId,
      },
    });

    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    // 3. Kiểm tra đã follow chưa
    const existingFollow = await this.followRepository.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existingFollow) {
      return existingFollow;
    }

    // 4. Tạo follow
    const follow = this.followRepository.create({
      follower_id: followerId,
      following_id: followingId,
    });
    await this.notificationService.create({
      recipientId: followingId,
      actorId: followerId,

      type: NotificationType.FOLLOW,

      entityType: NotificationEntityType.USER,

      entityId: followerId,

      title: 'New follower',

      message: 'Someone started following you',
    });

    return this.followRepository.save(follow);
  }
  // unfollow
  async unfollow(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);

    return {
      message: 'Unfollowed successfully',
    };
  }
  // Lấy tất cả follower của user_id
  async getFollowers(userId: string, skip = 0, take = 20) {
    const follows = await this.followRepository.find({
      where: {
        following_id: userId,
      },
      relations: {
        follower: true,
      },
      skip,
      take,
      order: {
        created_at: 'DESC',
      },
    });

    return follows.map((follow) => ({
      id: follow.follower.id,
      full_name: follow.follower.full_name,
      avatar_url: follow.follower.avatar_url,
      role: follow.follower.role,
      location: follow.follower.location,
    }));
  }
  // User_id đang follow những ai
  async getFollowing(userId: string, skip = 0, take = 20) {
    const follows = await this.followRepository.find({
      where: {
        follower_id: userId,
      },
      relations: {
        following: true,
      },
      skip,
      take,
      order: {
        created_at: 'DESC',
      },
    });

    return follows.map((follow) => ({
      id: follow.following.id,
      full_name: follow.following.full_name,
      avatar_url: follow.following.avatar_url,
      role: follow.following.role,
      location: follow.following.location,
    }));
  }
  async getCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.followRepository.count({
        where: { following_id: userId },
      }),
      this.followRepository.count({
        where: { follower_id: userId },
      }),
    ]);

    return { followers, following };
  }

  // Check xem đang có follow hay không
  async getStatus(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    return {
      isFollowing: !!follow,
    };
  }
}
