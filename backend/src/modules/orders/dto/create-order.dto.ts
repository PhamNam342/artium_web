import { IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  artworkId: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, unknown>;
}
