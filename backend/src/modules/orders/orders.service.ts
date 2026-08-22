import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { stringify } from 'querystring';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from '../artworks/artwork.entity';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly config: ConfigService,
  ) {}

  async createOrder(
    collectorId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const savedOrder = await this.orderRepository.manager.transaction(
      async (manager) => {
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
          throw new BadRequestException(
            'Artwork is not available for purchase',
          );
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
          paymentStatus: PaymentStatus.UNPAID,
        });

        artwork.status = ArtworkStatus.RESERVED;
        await artworkRepository.save(artwork);

        return manager.getRepository(Order).save(order);
      },
    );

    return this.toResponseDto(savedOrder);
  }

  async getUserOrders(collectorId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { collectorId },
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => this.toResponseDto(order));
  }

  async createVnpayPayment(
    id: string,
    userId: string,
    ipAddress: string,
  ): Promise<{ paymentUrl: string }> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    if (order.collectorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to pay this order',
      );
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order has already been paid');
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cancelled orders cannot be paid');
    }
    const artwork = await this.orderRepository.manager
      .getRepository(Artwork)
      .findOne({ where: { id: order.artworkId } });
    if (!artwork || (artwork.currency ?? 'VND').toUpperCase() !== 'VND') {
      throw new BadRequestException(
        'VNPay currently supports artworks priced in VND only',
      );
    }
    const amount = Number(order.totalAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Order has an invalid payment amount');
    }

    const tmnCode = this.config.get<string>('VNPAY_TMN_CODE');
    const hashSecret = this.config.get<string>('VNPAY_HASH_SECRET');
    const returnUrl = this.config.get<string>('VNPAY_RETURN_URL');
    const paymentUrl = this.config.get<string>(
      'VNPAY_PAYMENT_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    if (!tmnCode || !hashSecret || !returnUrl) {
      throw new BadRequestException('VNPay is not configured');
    }

    const now = new Date();
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(Math.round(amount * 100)),
      vnp_CreateDate: this.formatVnpayDate(now),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: this.normalizeIp(ipAddress),
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: order.id,
    };
    const query = stringify(
      Object.fromEntries(
        Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
      ),
    );
    const secureHash = createHmac('sha512', hashSecret)
      .update(query, 'utf8')
      .digest('hex');
    return {
      paymentUrl: `${paymentUrl}?${query}&vnp_SecureHash=${secureHash}`,
    };
  }

  async handleVnpayReturn(
    query: Record<string, unknown>,
  ): Promise<{ orderId: string; success: boolean }> {
    const params = Object.fromEntries(
      Object.entries(query)
        .filter(
          ([key, value]) =>
            key.startsWith('vnp_') &&
            key !== 'vnp_SecureHash' &&
            key !== 'vnp_SecureHashType' &&
            typeof value === 'string',
        )
        .map(([key, value]) => [key, value as string]),
    );
    const providedHash =
      typeof query.vnp_SecureHash === 'string' ? query.vnp_SecureHash : '';
    const secret = this.config.get<string>('VNPAY_HASH_SECRET');
    const orderId = params.vnp_TxnRef;
    if (!secret || !providedHash || !orderId)
      throw new BadRequestException('Invalid VNPay callback');
    const signed = createHmac('sha512', secret)
      .update(
        stringify(
          Object.fromEntries(
            Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
          ),
        ),
        'utf8',
      )
      .digest('hex');
    const valid =
      providedHash.length === signed.length &&
      timingSafeEqual(Buffer.from(providedHash), Buffer.from(signed));
    if (!valid) throw new BadRequestException('Invalid VNPay signature');

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    if (
      params.vnp_Amount !== String(Math.round(Number(order.totalAmount) * 100))
    ) {
      throw new BadRequestException('Invalid VNPay amount');
    }
    const success =
      params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';
    await this.orderRepository.manager.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const currentOrder = await orderRepository.findOne({
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!currentOrder)
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      if (currentOrder.paymentStatus === PaymentStatus.PAID) return;

      currentOrder.paymentStatus = success
        ? PaymentStatus.PAID
        : PaymentStatus.FAILED;
      if (!success && currentOrder.status === OrderStatus.PENDING) {
        currentOrder.status = OrderStatus.CANCELLED;
        const artworkRepository = manager.getRepository(Artwork);
        const artwork = await artworkRepository.findOne({
          where: { id: currentOrder.artworkId },
          lock: { mode: 'pessimistic_write' },
        });
        if (artwork?.status === ArtworkStatus.RESERVED) {
          artwork.status = ArtworkStatus.ACTIVE;
          await artworkRepository.save(artwork);
        }
      }
      await orderRepository.save(currentOrder);
    });
    return { orderId, success };
  }

  private formatVnpayDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  private normalizeIp(ip: string): string {
    return ip.replace(/^::ffff:/, '').slice(0, 45);
  }

  async getOrderById(
    id: string,
    user: { id: string; role: string | null },
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.collectorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to access this order',
      );
    }

    return this.toResponseDto(order);
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    user: { id: string; role: string | null },
  ): Promise<OrderResponseDto> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update order status');
    }

    const savedOrder = await this.orderRepository.manager.transaction(
      async (manager) => {
        const orderRepository = manager.getRepository(Order);
        const order = await orderRepository.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!order) {
          throw new NotFoundException(`Order with ID ${id} not found`);
        }

        const previousStatus = order.status;
        order.status = updateOrderStatusDto.status;

        const artworkRepository = manager.getRepository(Artwork);
        const artwork = await artworkRepository.findOne({
          where: { id: order.artworkId },
          lock: { mode: 'pessimistic_write' },
        });

        if (artwork) {
          if (
            updateOrderStatusDto.status === OrderStatus.CANCELLED &&
            previousStatus !== OrderStatus.CANCELLED &&
            artwork.status === ArtworkStatus.RESERVED
          ) {
            artwork.status = ArtworkStatus.ACTIVE;
          }

          if (
            updateOrderStatusDto.status === OrderStatus.DELIVERED &&
            artwork.status === ArtworkStatus.RESERVED
          ) {
            artwork.status = ArtworkStatus.SOLD;
          }

          await artworkRepository.save(artwork);
        }

        return orderRepository.save(order);
      },
    );

    return this.toResponseDto(savedOrder);
  }

  private toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      collectorId: order.collectorId,
      artworkId: order.artworkId,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: this.toShippingAddress(order.shippingAddress),
      paymentStatus: order.paymentStatus ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toShippingAddress(
    shippingAddress: unknown,
  ): Record<string, unknown> | null {
    if (
      shippingAddress === null ||
      typeof shippingAddress !== 'object' ||
      Array.isArray(shippingAddress)
    ) {
      return null;
    }

    return shippingAddress as Record<string, unknown>;
  }
}
