import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from '../artworks/artwork.entity';
import { ArtworkComment } from './artwork/comments/entities/artwork-comment.entity';
import { ArtworkCommentService } from './artwork/comments/artwork-comment.service';
import { ArtworkLike } from './artwork/likes/entities/artwork-like.entity';
import { ArtworkLikeService } from './artwork/likes/artwork-like.service';
import { Follow } from './followers/entities/follow.entity';
import { FollowersService } from './followers/followers.service';
import { User } from '../../identity/user/entities/user.entity';

describe('Community service business rules', () => {
  const artworkId = 'artwork-id';

  it('rejects self-follow and a missing follow target', async () => {
    const follows = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    const users = { findOne: jest.fn() };
    const service = new FollowersService(follows as unknown as Repository<Follow>, users as unknown as Repository<User>, { create: jest.fn() } as never);

    await expect(service.follow('user-id', 'user-id')).rejects.toBeInstanceOf(BadRequestException);
    users.findOne.mockResolvedValue(null);
    await expect(service.follow('user-id', 'missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects duplicate likes and likes for a non-public artwork', async () => {
    const likes = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    const artworks = { findOne: jest.fn() };
    const service = new ArtworkLikeService(likes as unknown as Repository<ArtworkLike>, artworks as unknown as Repository<Artwork>, { create: jest.fn() } as never);

    artworks.findOne.mockResolvedValue(null);
    await expect(service.like('user-id', artworkId)).rejects.toBeInstanceOf(NotFoundException);
    artworks.findOne.mockResolvedValue({ id: artworkId, sellerId: 'artist-id', isPublished: true, status: ArtworkStatus.ACTIVE });
    likes.findOne.mockResolvedValue({ id: 'like-id' });
    await expect(service.like('user-id', artworkId)).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents users from editing or deleting another user comment', async () => {
    const comments = { findOne: jest.fn(), save: jest.fn(), remove: jest.fn() };
    const service = new ArtworkCommentService(comments as unknown as Repository<ArtworkComment>, {} as Repository<Artwork>, {} as never);
    comments.findOne.mockResolvedValue({ id: 'comment-id', userId: 'owner-id' });

    await expect(service.update('comment-id', 'other-user', { content: 'Changed' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.remove('comment-id', 'other-user')).rejects.toBeInstanceOf(BadRequestException);
    expect(comments.save).not.toHaveBeenCalled();
    expect(comments.remove).not.toHaveBeenCalled();
  });
});
