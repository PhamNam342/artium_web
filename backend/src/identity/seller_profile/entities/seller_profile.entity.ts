import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';

export enum VerificationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('seller_profiles')
export class SellerProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
    unique: true,
  })
  userId!: string;

  @OneToOne(() => User, (user) => user.sellerProfile)
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio!: string | null;

  @Column({
    name: 'website_url',
    type: 'varchar',
    nullable: true,
  })
  websiteUrl!: string | null;

  @Column({
    name: 'is_visible',
    type: 'boolean',
    default: true,
  })
  isVisible!: boolean;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
  })
  isVerified!: boolean;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NONE,
  })
  verificationStatus!: VerificationStatus;
}
