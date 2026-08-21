import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(collectorId: string, createOrderDto: CreateOrderDto): Promise<{ orderId: string }> {
    const order = this.orderRepository.create({
      collectorId,
      status: OrderStatus.PENDING,
      artworkId: createOrderDto.artworkId,
      subtotal: createOrderDto.subtotal,
      shippingCost: createOrderDto.shippingCost,
      totalAmount: createOrderDto.totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      paymentStatus: createOrderDto.paymentStatus,
    });

    const savedOrder = await this.orderRepository.save(order);

    return { orderId: savedOrder.id };
  }

  async getUserOrders(collectorId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { collectorId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { collector: true },
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
