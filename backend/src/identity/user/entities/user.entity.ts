import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { SellerProfile } from '../../seller_profile/entities/seller_profile.entity';
export enum UserRole {
  ADMIN = 'ADMIN',
  ARTIST = 'ARTIST',
  COLLECTOR = 'COLLECTOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 320,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  password?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  full_name?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  role?: UserRole | null;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  avatar_url?: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  google_id?: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  stripe_customer_id?: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'update_at',
  })
  update_at!: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  location?: string;
  @OneToOne(() => SellerProfile, (sellerProfile) => sellerProfile.user)
  sellerProfile!: SellerProfile;
}
