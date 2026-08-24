import type { Artwork } from '../artworks/types';

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type OrderPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
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
  shippingAddress: ShippingAddress;
  paymentStatus: OrderPaymentStatus;
  payosOrderCode: string | null;
  paymentLinkId: string | null;
  paymentCheckoutUrl: string | null;
  paymentExpiresAt: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
  artwork?: Artwork;
}

export interface CreateOrderDto {
  artworkId: string;
  shippingAddress: ShippingAddress;
}

export interface PaymentLinkResponse {
  orderId: string;
  orderCode: string | null;
  paymentLinkId: string | null;
  checkoutUrl: string | null;
  expiresAt: string | null;
  paymentStatus: OrderPaymentStatus;
}
