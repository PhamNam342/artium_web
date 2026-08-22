export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ShippingAddress {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
}

export interface Order {
  id: string;
  collectorId: string;
  artworkId: string;
  subtotal: number | null;
  shippingCost: number | null;
  totalAmount: number | null;
  status: OrderStatus;
  shippingAddress: ShippingAddress | null;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  artworkId: string;
  shippingAddress: ShippingAddress;
}
