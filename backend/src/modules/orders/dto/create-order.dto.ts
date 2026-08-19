export class CreateOrderDto {
  artworkId: string;
  subtotal?: number;
  shippingCost?: number;
  totalAmount?: number;
  shippingAddress?: any;
  paymentStatus?: string;
}
