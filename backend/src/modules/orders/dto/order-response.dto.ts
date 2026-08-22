import { OrderStatus, PaymentStatus } from '../order.entity';

export class OrderResponseDto {
  id!: string;
  collectorId!: string;
  artworkId!: string;
  subtotal!: number;
  shippingCost!: number;
  totalAmount!: number;
  status!: OrderStatus;
  shippingAddress!: Record<string, unknown> | null;
  paymentStatus!: PaymentStatus | null;
  createdAt!: Date;
  updatedAt!: Date;
}
