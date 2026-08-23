import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from '../artworks/artwork.entity';
import { PayOSService } from '../payments/payos.service';
import { Order, OrderPaymentStatus, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { Webhook } from '@payos/node';

function isPayOSSequenceRows(
  value: unknown,
): value is Array<{ value: string | number }> {
  if (!Array.isArray(value) || value.length === 0) return false;
  const row: unknown = value[0];
  if (typeof row !== 'object' || row === null || !('value' in row)) {
    return false;
  }
  return typeof row.value === 'string' || typeof row.value === 'number';
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly payOSService: PayOSService,
    private readonly config: ConfigService,
  ) {}

  async createOrder(
    collectorId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.orderRepository.manager.transaction(async (manager) => {
      const artworkRepository = manager.getRepository(Artwork);
      const artwork = await artworkRepository
        .createQueryBuilder('artwork')
        .setLock('pessimistic_write')
        .where('artwork.id = :artworkId', {
          artworkId: createOrderDto.artworkId,
        })
        .getOne();

      if (!artwork) {
        throw new NotFoundException('Artwork not found');
      }

      if (
        artwork.status !== ArtworkStatus.ACTIVE ||
        !artwork.isPublished ||
        artwork.price === null
      ) {
        throw new BadRequestException('Artwork is not available for purchase');
      }

      const subtotal = Number(artwork.price);
      if (!Number.isFinite(subtotal) || subtotal < 0) {
        throw new BadRequestException('Artwork has an invalid price');
      }

      const shippingCost = 0;
      const totalAmount = subtotal + shippingCost;
      const order = manager.getRepository(Order).create({
        collectorId,
        status: OrderStatus.PENDING,
        artworkId: artwork.id,
        subtotal,
        shippingCost,
        totalAmount,
        shippingAddress: createOrderDto.shippingAddress,
        paymentStatus: OrderPaymentStatus.PENDING,
      });

      artwork.status = ArtworkStatus.RESERVED;
      await artworkRepository.save(artwork);

      return manager.getRepository(Order).save(order);
    });
  }

  async getUserOrders(collectorId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { collectorId },
      order: { createdAt: 'DESC' },
    });
  }

  async createPaymentLink(
    id: string,
    user: { id: string; role: string | null },
  ) {
    const order = await this.getOrderById(id, user);

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      return this.paymentLinkResponse(order);
    }

    if (
      order.status !== OrderStatus.PENDING ||
      order.paymentStatus !== OrderPaymentStatus.PENDING
    ) {
      throw new BadRequestException('Order is not awaiting payment');
    }

    const amount = Number(order.totalAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('Order has an invalid payment amount');
    }

    if (!order.payosOrderCode) {
      const rows: unknown = await this.orderRepository.query(
        `SELECT nextval('orders_payos_order_code_seq') AS "value"`,
      );
      if (!isPayOSSequenceRows(rows)) {
        throw new InternalServerErrorException(
          'Unable to allocate a PayOS order code',
        );
      }
      order.payosOrderCode = String(rows[0].value);
      await this.orderRepository.save(order);
    }

    if (order.paymentLinkId && order.paymentCheckoutUrl) {
      return this.paymentLinkResponse(order);
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60;
    const paymentLink = await this.payOSService.createPaymentLink({
      orderCode: Number(order.payosOrderCode),
      amount,
      description: `Artium-${order.id.slice(0, 8)}`,
      returnUrl: `${frontendUrl}/payment/success?orderId=${order.id}`,
      cancelUrl: `${frontendUrl}/payment/cancel?orderId=${order.id}`,
      expiredAt,
    });

    order.paymentLinkId = paymentLink.paymentLinkId;
    order.paymentCheckoutUrl = paymentLink.checkoutUrl;
    order.paymentExpiresAt = paymentLink.expiredAt
      ? new Date(paymentLink.expiredAt * 1000)
      : new Date(expiredAt * 1000);
    await this.orderRepository.save(order);

    return this.paymentLinkResponse(order);
  }

  async cancelPayment(
    id: string,
    user: { id: string; role: string | null },
  ): Promise<Order> {
    const order = await this.getOrderById(id, user);

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException('Paid orders cannot be cancelled here');
    }

    if (order.payosOrderCode && order.paymentLinkId) {
      await this.payOSService.cancelPaymentLink(
        Number(order.payosOrderCode),
        'Cancelled by customer',
      );
    }

    return this.orderRepository.manager.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const artworkRepository = manager.getRepository(Artwork);
      const lockedOrder = await orderRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (lockedOrder.paymentStatus === OrderPaymentStatus.PAID) {
        throw new BadRequestException('Paid orders cannot be cancelled here');
      }

      lockedOrder.status = OrderStatus.CANCELLED;
      lockedOrder.paymentStatus = OrderPaymentStatus.CANCELLED;
      const artwork = await artworkRepository.findOne({
        where: { id: lockedOrder.artworkId },
        lock: { mode: 'pessimistic_write' },
      });

      if (artwork?.status === ArtworkStatus.RESERVED) {
        artwork.status = ArtworkStatus.ACTIVE;
        await artworkRepository.save(artwork);
      }

      return orderRepository.save(lockedOrder);
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expirePendingPayments(): Promise<void> {
    const pendingOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PENDING,
        paymentStatus: OrderPaymentStatus.PENDING,
      },
    });
    const now = Date.now();

    for (const pendingOrder of pendingOrders) {
      if (
        !pendingOrder.paymentExpiresAt ||
        pendingOrder.paymentExpiresAt.getTime() > now
      ) {
        continue;
      }

      await this.orderRepository.manager.transaction(async (manager) => {
        const orderRepository = manager.getRepository(Order);
        const artworkRepository = manager.getRepository(Artwork);
        const order = await orderRepository.findOne({
          where: { id: pendingOrder.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (
          !order ||
          order.status !== OrderStatus.PENDING ||
          order.paymentStatus !== OrderPaymentStatus.PENDING ||
          !order.paymentExpiresAt ||
          order.paymentExpiresAt.getTime() > now
        ) {
          return;
        }

        order.status = OrderStatus.CANCELLED;
        order.paymentStatus = OrderPaymentStatus.EXPIRED;
        const artwork = await artworkRepository.findOne({
          where: { id: order.artworkId },
          lock: { mode: 'pessimistic_write' },
        });

        if (artwork?.status === ArtworkStatus.RESERVED) {
          artwork.status = ArtworkStatus.ACTIVE;
          await artworkRepository.save(artwork);
        }

        await orderRepository.save(order);
      });
    }
  }

  async handlePayOSWebhook(webhook: Webhook): Promise<Order> {
    const payment = await this.payOSService.verifyWebhook(webhook);

    if (payment.code !== '00' || payment.currency !== 'VND') {
      throw new BadRequestException('PayOS payment was not successful');
    }

    return this.orderRepository.manager.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { payosOrderCode: String(payment.orderCode) },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order for PayOS payment not found');
      }

      if (Number(order.totalAmount) !== payment.amount) {
        throw new BadRequestException(
          'PayOS payment amount does not match order',
        );
      }

      if (
        order.paymentLinkId &&
        order.paymentLinkId !== payment.paymentLinkId
      ) {
        throw new BadRequestException(
          'PayOS payment link does not match order',
        );
      }

      if (order.paymentStatus === OrderPaymentStatus.PAID) {
        return order;
      }

      if (order.paymentStatus !== OrderPaymentStatus.PENDING) {
        throw new BadRequestException('Order is not awaiting payment');
      }

      order.paymentStatus = OrderPaymentStatus.PAID;
      order.paymentReference = payment.reference;
      order.paidAt = new Date();

      return orderRepository.save(order);
    });
  }

  async getOrderById(
    id: string,
    user: { id: string; role: string | null },
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { collector: true, artwork: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.collectorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to access this order',
      );
    }

    return order;
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    user: { id: string; role: string | null },
  ): Promise<Order> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update order status');
    }

    return this.orderRepository.manager.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const previousStatus = order.status;
      this.assertStatusTransition(previousStatus, updateOrderStatusDto.status);

      if (previousStatus === updateOrderStatusDto.status) {
        return orderRepository.save(order);
      }

      if (
        [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(
          updateOrderStatusDto.status,
        ) &&
        order.paymentStatus !== OrderPaymentStatus.PAID
      ) {
        throw new BadRequestException('Order must be paid before fulfillment');
      }

      if (
        updateOrderStatusDto.status === OrderStatus.CANCELLED &&
        order.paymentStatus === OrderPaymentStatus.PAID
      ) {
        throw new BadRequestException(
          'Paid orders require a refund before cancellation',
        );
      }

      order.status = updateOrderStatusDto.status;

      const artworkRepository = manager.getRepository(Artwork);
      const artwork = await artworkRepository.findOne({
        where: { id: order.artworkId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!artwork) {
        throw new NotFoundException(
          `Artwork with ID ${order.artworkId} not found`,
        );
      }

      if (artwork.status !== ArtworkStatus.RESERVED) {
        throw new BadRequestException(
          'Artwork status is inconsistent with the order',
        );
      }

      if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
        artwork.status = ArtworkStatus.ACTIVE;
        order.paymentStatus = OrderPaymentStatus.CANCELLED;
      }

      if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
        artwork.status = ArtworkStatus.SOLD;
      }

      await artworkRepository.save(artwork);

      return orderRepository.save(order);
    });
  }

  private assertStatusTransition(
    previousStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.PENDING,
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.SHIPPED]: [
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERED]: [OrderStatus.DELIVERED],
      [OrderStatus.CANCELLED]: [OrderStatus.CANCELLED],
    };

    if (!allowedTransitions[previousStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot change order status from ${previousStatus} to ${nextStatus}`,
      );
    }
  }

  private paymentLinkResponse(order: Order) {
    return {
      orderId: order.id,
      orderCode: order.payosOrderCode,
      paymentLinkId: order.paymentLinkId,
      checkoutUrl: order.paymentCheckoutUrl,
      expiresAt: order.paymentExpiresAt,
      paymentStatus: order.paymentStatus,
    };
  }
}
