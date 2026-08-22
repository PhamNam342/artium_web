import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './order.entity';
import { Artwork } from '../artworks/artwork.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Order, Artwork])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
