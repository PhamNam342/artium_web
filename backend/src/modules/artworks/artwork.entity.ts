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
  publicId?: string;
  url: string;
  secureUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  bucket?: string;
  alt?: string;
  altText?: string;
  order?: number;
  isPrimary?: boolean;
};

export type ArtworkDimensions = {
  height?: number;
  width?: number;
  depth?: number;
  unit?: string;
};

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency!: string | null;

  @Column({
    type: 'enum',
    enum: ArtworkStatus,
    default: ArtworkStatus.DRAFT,
  })
  status!: ArtworkStatus;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'jsonb', default: [] })
  images!: ArtworkImage[];

  @Column({ name: 'folder_id', type: 'uuid', nullable: true })
  folderId!: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({
    name: 'custom_tags',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  customTags!: string[];

  @ManyToMany(() => Tag, (tag) => tag.artworks, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'artwork_tags',
    joinColumn: { name: 'artwork_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Tag[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'materials', type: 'varchar', length: 80, nullable: true })
  materials!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  dimensions!: ArtworkDimensions | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight!: string | null;
}
