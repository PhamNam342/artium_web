import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  artworkId: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsObject()
  shippingAddress?: any;

  @IsOptional()
  @IsString()
  paymentStatus?: string;
}
