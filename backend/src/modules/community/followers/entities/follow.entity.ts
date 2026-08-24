import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../../identity/user/entities/user.entity';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'follower_id',
  })
  follower_id!: string;

  @Column({
    type: 'uuid',
    name: 'following_id',
  })
  following_id!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at!: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'follower_id',
  })
  follower!: User;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'following_id',
  })
  following!: User;
}
