import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('artwork_likes')
@Unique(['userId', 'artworkId'])
export class ArtworkLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ type: 'uuid' })
  artworkId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
