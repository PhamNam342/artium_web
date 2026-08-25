import { Expose, Type } from 'class-transformer';
import { ArtworkResponseDto } from '../../artworks/dto/artwork-response.dto';
import { OrderPaymentStatus, OrderStatus } from '../order.entity';

export class OrderCollectorResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  fullName!: string | null;

  @Expose()
  avatarUrl!: string | null;
}

export class OrderShippingAddressResponseDto {
  @Expose()
  fullName!: string;

  @Expose()
  addressLine1!: string;

  @Expose()
  addressLine2?: string;

  @Expose()
  city!: string;

  @Expose()
  country!: string;

  @Expose()
  postalCode?: string;

  @Expose()
  phone?: string;
}

export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  collectorId!: string;

  @Expose()
  artworkId!: string;

  @Expose()
  subtotal!: number | string | null;

  @Expose()
  shippingCost!: number | string | null;

  @Expose()
  totalAmount!: number | string | null;

  @Expose()
  status!: OrderStatus;

  @Expose()
  @Type(() => OrderShippingAddressResponseDto)
  shippingAddress!: OrderShippingAddressResponseDto | null;

  @Expose()
  paymentStatus!: OrderPaymentStatus;

  @Expose()
  payosOrderCode!: string | null;

  @Expose()
  paymentLinkId!: string | null;

  @Expose()
  paymentCheckoutUrl!: string | null;

  @Expose()
  paymentExpiresAt!: string | null;

  @Expose()
  paidAt!: string | null;

  @Expose()
  paymentReference!: string | null;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => OrderCollectorResponseDto)
  collector?: OrderCollectorResponseDto;

  @Expose()
  @Type(() => ArtworkResponseDto)
  artwork?: ArtworkResponseDto;
}
