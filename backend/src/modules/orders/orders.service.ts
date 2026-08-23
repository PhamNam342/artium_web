import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from '../artworks/artwork.entity';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
}
