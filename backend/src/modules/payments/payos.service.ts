import {
  PayOS,
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse,
  type Webhook,
  type WebhookData,
} from '@payos/node';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayOSService {
  constructor(private readonly config: ConfigService) {}

  async createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse> {
    return this.client.paymentRequests.create(request);
  }

  async verifyWebhook(webhook: Webhook): Promise<WebhookData> {
    return this.client.webhooks.verify(webhook);
  }

  async cancelPaymentLink(orderCode: number, reason: string) {
    return this.client.paymentRequests.cancel(orderCode, reason);
  }

  private get client(): PayOS {
    const clientId = this.config.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.config.get<string>('PAYOS_API_KEY');
    const checksumKey = this.config.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new InternalServerErrorException('PayOS is not configured');
    }

    return new PayOS({ clientId, apiKey, checksumKey });
  }
}
