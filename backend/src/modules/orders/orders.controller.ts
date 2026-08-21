import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Headers('x-user-id') collectorId: string, // Mocking authentication since there is no AuthGuard yet
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // In a real scenario, collectorId should be extracted from req.user
    if (!collectorId) {
      // Mocking a default user for testing purposes if header is missing
      collectorId = '00000000-0000-0000-0000-000000000000';
    }
    return this.ordersService.createOrder(collectorId, createOrderDto);
  }

  @Get()
  async getUserOrders(@Headers('x-user-id') collectorId: string) {
    if (!collectorId) {
      collectorId = '00000000-0000-0000-0000-000000000000';
    }
    return this.ordersService.getUserOrders(collectorId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Put(':id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }
}
