import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { RequestWithUser } from '../../identity/auth/interfaces/request-with-user.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Req() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Post(':id/payments/vnpay')
  @UseGuards(JwtAuthGuard)
  async createVnpayPayment(
    @Req() req: RequestWithUser & Request,
    @Param('id') id: string,
  ) {
    return this.ordersService.createVnpayPayment(
      id,
      req.user.id,
      req.ip ?? '127.0.0.1',
    );
  }

  @Get('payment/vnpay-return')
  async handleVnpayReturn(@Req() req: Request, @Res() res: Response) {
    const result = await this.ordersService.handleVnpayReturn(req.query);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/orders/${result.orderId}?payment=${result.success ? 'success' : 'failed'}`,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
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
