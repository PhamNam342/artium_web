import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tag } from './tag.entity';

export enum ArtworkStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export type ArtworkImage = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
};

export type ArtworkDimensions = {
  height: number;
  width: number;
  depth?: number;
  unit: string;
};

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({
    type: 'enum',
    enum: ArtworkStatus,
    enumName: 'artworks_status_enum',
    default: ArtworkStatus.DRAFT,
  })
  status!: ArtworkStatus;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  images!: ArtworkImage[];

  @Column({ name: 'folder_id', type: 'uuid' })
  folderId!: string;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @ManyToMany(() => Tag, (tag) => tag.artworks)
  @JoinTable({
    name: 'artwork_tags',
    joinColumn: { name: 'artwork_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Tag[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'materials', type: 'varchar', length: 80, nullable: true })
  material!: string | null;

  @Column({ type: 'jsonb' })
  dimensions!: ArtworkDimensions;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight!: string;
}
