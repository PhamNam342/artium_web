import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
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
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Post(':id/payment')
  async createPaymentLink(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.ordersService.createPaymentLink(id, req.user);
  }

  @Post(':id/payment/cancel')
  async cancelPayment(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancelPayment(id, req.user);
  }

  @Get()
  async getUserOrders(
    @Req() req: RequestWithUser,
  ): Promise<OrderResponseDto[]> {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  async getOrderById(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.getOrderById(id, req.user);
  }

  @Put(':id')
  async updateOrderStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto,
      req.user,
    );
  }
}
