import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './order.entity';
import { Artwork } from '../artworks/artwork.entity';
import { PayOSModule } from '../payments/payos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Artwork]), PayOSModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
