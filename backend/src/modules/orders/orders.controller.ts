import { Controller, Post, Get, Put, Body, Param, Headers } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Headers('x-user-id') userId: string, // Mocking authentication since there is no AuthGuard yet
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // In a real scenario, userId should be extracted from req.user
    if (!userId) {
      // Mocking a default user for testing purposes if header is missing
      userId = '00000000-0000-0000-0000-000000000000';
    }
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  async getUserOrders(@Headers('x-user-id') userId: string) {
    if (!userId) {
      userId = '00000000-0000-0000-0000-000000000000';
    }
    return this.ordersService.getUserOrders(userId);
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
