import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Artwork } from './artwork.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ManyToMany(() => Artwork, (artwork) => artwork.tags, {
    onDelete: 'CASCADE',
  })
  artworks?: Artwork[];
}
