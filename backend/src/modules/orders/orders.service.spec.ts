import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from '../artworks/artwork.entity';
import { PayOSService } from '../payments/payos.service';
import { Order, OrderPaymentStatus, OrderStatus } from './order.entity';
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
      collector: {
        id: collector.id,
        email: 'collector@example.com',
        full_name: 'Collector Name',
        avatar_url: null,
        password: 'hashed-password-must-not-be-exposed',
      },
      artwork: { id: 'artwork-id', status: ArtworkStatus.RESERVED },
    } as Order;
    const findOne = jest.fn().mockResolvedValue(order);
    const orderRepository = {
      findOne,
    } as unknown as Repository<Order>;
    const service = new OrdersService(
      orderRepository,
      {} as PayOSService,
      {} as ConfigService,
    );

    const response = await service.getOrderById('order-id', collector);

    expect(response.id).toBe(order.id);
    expect(response.collectorId).toBe(collector.id);
    expect(response.artworkId).toBe(order.artworkId);
    expect(response.artwork?.id).toBe(order.artworkId);
    expect(response.artwork?.status).toBe(ArtworkStatus.RESERVED);
    expect(response.collector).toEqual({
      id: collector.id,
      email: 'collector@example.com',
      fullName: 'Collector Name',
      avatarUrl: null,
    });
    expect(response.collector).not.toHaveProperty('password');

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
    const service = new OrdersService(
      orderRepository,
      {} as PayOSService,
      {} as ConfigService,
    );

    await expect(
      service.updateOrderStatus(
        'order-id',
        { status: OrderStatus.DELIVERED },
        admin,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(orderRepo.save).not.toHaveBeenCalled();
  });

  it('does not ship an unpaid order', async () => {
    const order = {
      id: 'order-id',
      collectorId: collector.id,
      artworkId: 'artwork-id',
      status: OrderStatus.PENDING,
      paymentStatus: OrderPaymentStatus.PENDING,
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
    const service = new OrdersService(
      orderRepository,
      {} as PayOSService,
      {} as ConfigService,
    );

    await expect(
      service.updateOrderStatus(
        order.id,
        { status: OrderStatus.SHIPPED },
        admin,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(artworkRepo.findOne).not.toHaveBeenCalled();
  });
});
