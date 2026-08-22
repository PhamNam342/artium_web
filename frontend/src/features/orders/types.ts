export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  collectorId: string;
  artworkId: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: any;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  artworkId: string;
  shippingAddress: any;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}
