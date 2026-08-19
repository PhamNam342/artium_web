import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<{ orderId: string }> {
    const { artworkIds } = createOrderDto;

    const order = this.orderRepository.create({
      userId,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = artworkIds.map((artworkId) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        artworkId,
      }),
    );

    await this.orderItemRepository.save(orderItems);

    return { orderId: savedOrder.id };
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.getOrderById(id);
    
    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
}
