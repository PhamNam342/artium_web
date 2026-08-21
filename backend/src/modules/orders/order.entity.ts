import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
// Note: If you have an Artwork entity, you can add ManyToOne relation here later

export enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'collector_id' })
  collector: User;

  @Column({ name: 'collector_id', type: 'uuid' })
  collectorId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  subtotal: number;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId: string;

  @Column({ name: 'shipping_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  shippingCost: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress: any;

  @Column({ name: 'payment_status', type: 'varchar', length: 50, nullable: true })
  paymentStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
