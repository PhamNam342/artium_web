import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { RequestWithUser } from '../../identity/auth/interfaces/request-with-user.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Req() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get()
  async getUserOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  async getOrderById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user);
  }

  @Put(':id')
  async updateOrderStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto,
      req.user,
    );
  }
}
