import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from '../artworks/artwork.entity';
import { Order, OrderStatus } from './order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const collector = { id: 'collector-id', role: null };
  const admin = { id: 'admin-id', role: 'ADMIN' };

  it('loads the reserved artwork with an order detail', async () => {
    const order = {
      id: 'order-id',
      collectorId: collector.id,
      artworkId: 'artwork-id',
      status: OrderStatus.PENDING,
      artwork: { id: 'artwork-id', status: ArtworkStatus.RESERVED },
    } as Order;
    const findOne = jest.fn().mockResolvedValue(order);
    const orderRepository = {
      findOne,
    } as unknown as Repository<Order>;
    const service = new OrdersService(orderRepository);

    await expect(service.getOrderById('order-id', collector)).resolves.toBe(
      order,
    );

    expect(findOne).toHaveBeenCalledWith({
      where: { id: 'order-id' },
      relations: { collector: true, artwork: true },
    });
  });

  it('rejects transitions after an order is cancelled', async () => {
    const order = {
      id: 'order-id',
      collectorId: collector.id,
      artworkId: 'artwork-id',
      status: OrderStatus.CANCELLED,
    } as Order;
    const orderRepo = {
      findOne: jest.fn().mockResolvedValue(order),
      save: jest.fn(),
    };
    const artworkRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn((entity: typeof Order | typeof Artwork) =>
        entity === Order ? orderRepo : artworkRepo,
      ),
    };
    const orderRepository = {
      manager: {
        transaction: jest.fn((callback: (value: typeof manager) => unknown) =>
          callback(manager),
        ),
      },
    } as unknown as Repository<Order>;
    const service = new OrdersService(orderRepository);

    await expect(
      service.updateOrderStatus(
        'order-id',
        { status: OrderStatus.DELIVERED },
        admin,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(orderRepo.save).not.toHaveBeenCalled();
  });
});
