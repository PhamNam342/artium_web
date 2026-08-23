import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../identity/user/entities/user.entity';
import { Artwork } from '../artworks/artwork.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum OrderPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'collector_id' })
  collector!: User;

  @Column({ name: 'collector_id', type: 'uuid' })
  collectorId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  subtotal!: number;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @ManyToOne(() => Artwork)
  @JoinColumn({ name: 'artwork_id' })
  artwork!: Artwork;

  @Column({
    name: 'shipping_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  shippingCost!: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress: any;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 50,
    default: OrderPaymentStatus.PENDING,
  })
  paymentStatus!: OrderPaymentStatus;

  @Column({
    name: 'payos_order_code',
    type: 'bigint',
    nullable: true,
    unique: true,
  })
  payosOrderCode!: string | null;

  @Column({
    name: 'payos_payment_link_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  paymentLinkId!: string | null;

  @Column({ name: 'payos_checkout_url', type: 'text', nullable: true })
  paymentCheckoutUrl!: string | null;

  @Column({ name: 'payment_expires_at', type: 'timestamp', nullable: true })
  paymentExpiresAt!: Date | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({
    name: 'payment_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paymentReference!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
