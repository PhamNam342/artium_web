import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { Webhook } from '@payos/node';
import { OrdersService } from '../orders/orders.service';

@Controller('payments/payos')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhook: Webhook) {
    await this.ordersService.handlePayOSWebhook(webhook);
    return { success: true };
  }
}
