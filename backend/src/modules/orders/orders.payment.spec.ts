/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/unbound-method */

import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtworkStatus } from '../artworks/artwork.entity';
import { Order, OrderPaymentStatus, OrderStatus } from './order.entity';
import { OrdersService } from './orders.service';
import { PayOSService } from './payos.service';

describe('OrdersService payments', () => {
  const collector = { id: 'collector-id', role: null };

  function createService(
    order: Partial<Order>,
    paymentLink = {
      orderCode: 123456789,
      paymentLinkId: 'link-id',
      checkoutUrl: 'https://pay.payos.vn/web/abc',
      amount: 100000,
      expiredAt: 1700000900,
    },
  ) {
    const orderRecord = {
      id: 'order-id',
      collectorId: collector.id,
      artworkId: 'artwork-id',
      subtotal: 100000,
      shippingCost: 0,
      totalAmount: 100000,
      status: OrderStatus.PENDING,
      paymentStatus: OrderPaymentStatus.PENDING,
      artwork: { status: ArtworkStatus.RESERVED },
      ...order,
    } as Order;
    const orderRepository = {
      findOne: jest.fn().mockResolvedValue(orderRecord),
      save: jest.fn().mockImplementation(async (value) => value),
      query: jest.fn().mockResolvedValue([{ value: '123456789' }]),
      manager: {
        transaction: jest.fn(async (callback) =>
          callback({
            getRepository: jest.fn(() => ({
              findOne: jest.fn().mockResolvedValue(orderRecord),
              save: jest.fn().mockImplementation(async (value) => value),
            })),
          }),
        ),
      },
    } as unknown as Repository<Order>;
    const payosService = {
      createPaymentLink: jest.fn().mockResolvedValue(paymentLink),
      verifyWebhook: jest.fn(),
      getPaymentLink: jest.fn(),
      cancelPaymentLink: jest.fn(),
    } as unknown as PayOSService;
    const config = {
      get: jest.fn().mockReturnValue('http://localhost:5173'),
    };

    return {
      service: new OrdersService(
        orderRepository,
        payosService,
        config as never,
      ),
      orderRepository,
      payosService,
      orderRecord,
    };
  }

  it('creates a PayOS payment link for the unpaid order', async () => {
    const { service, payosService, orderRepository } = createService({});

    await expect(
      service.createPaymentLink('order-id', collector),
    ).resolves.toEqual(
      expect.objectContaining({
        checkoutUrl: 'https://pay.payos.vn/web/abc',
        paymentLinkId: 'link-id',
      }),
    );

    expect(payosService.createPaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 100000,
        returnUrl: expect.stringContaining('/payment/success'),
        cancelUrl: expect.stringContaining('/payment/cancel'),
      }),
    );
    expect(orderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentStatus: OrderPaymentStatus.PENDING,
        paymentLinkId: 'link-id',
      }),
    );
  });

  it('marks the order paid only after a verified matching webhook', async () => {
    const { service, payosService, orderRepository, orderRecord } =
      createService({
        payosOrderCode: '123456789',
      });
    (payosService.verifyWebhook as jest.Mock).mockResolvedValue({
      orderCode: 123456789,
      amount: 100000,
      currency: 'VND',
      code: '00',
      reference: 'bank-reference',
      paymentLinkId: 'link-id',
    });

    await expect(
      service.handlePayOSWebhook({ signature: 'valid' }),
    ).resolves.toEqual(
      expect.objectContaining({ paymentStatus: OrderPaymentStatus.PAID }),
    );

    expect(orderRecord.paymentStatus).toBe(OrderPaymentStatus.PAID);
    expect(orderRecord.paymentReference).toBe('bank-reference');
    expect(orderRepository.manager.transaction).toHaveBeenCalled();
  });

  it('rejects a webhook when the amount does not match the order', async () => {
    const { service, payosService, orderRecord } = createService({
      payosOrderCode: '123456789',
    });
    (payosService.verifyWebhook as jest.Mock).mockResolvedValue({
      orderCode: 123456789,
      amount: 1,
      currency: 'VND',
      code: '00',
      reference: 'bank-reference',
      paymentLinkId: 'link-id',
    });

    await expect(
      service.handlePayOSWebhook({ signature: 'valid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(orderRecord.paymentStatus).toBe(OrderPaymentStatus.PENDING);
  });

  it('treats a duplicate successful webhook as idempotent', async () => {
    const { service, payosService, orderRecord } = createService({
      payosOrderCode: '123456789',
      paymentStatus: OrderPaymentStatus.PAID,
      paymentLinkId: 'link-id',
    });
    (payosService.verifyWebhook as jest.Mock).mockResolvedValue({
      orderCode: 123456789,
      amount: 100000,
      currency: 'VND',
      code: '00',
      reference: 'bank-reference',
      paymentLinkId: 'link-id',
    });

    await expect(
      service.handlePayOSWebhook({ signature: 'valid' }),
    ).resolves.toBe(orderRecord);
  });

  it('acknowledges a verified PayOS webhook validation callback', async () => {
    const { service, payosService, orderRepository } = createService({});
    (payosService.verifyWebhook as jest.Mock).mockResolvedValue({
      orderCode: 123,
      amount: 100000,
      currency: 'VND',
      code: '00',
      reference: 'validation-reference',
      paymentLinkId: 'link-id',
    });

    await expect(
      service.handlePayOSWebhook({ signature: 'valid' }),
    ).resolves.toBeUndefined();
    expect(orderRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('expires unpaid orders and releases their reserved artwork', async () => {
    const order = {
      id: 'order-id',
      artworkId: 'artwork-id',
      status: OrderStatus.PENDING,
      paymentStatus: OrderPaymentStatus.PENDING,
      paymentExpiresAt: new Date(Date.now() - 1000),
    } as Order;
    const artwork = { id: 'artwork-id', status: ArtworkStatus.RESERVED };
    const orderRepositoryInTransaction = {
      findOne: jest.fn().mockResolvedValue(order),
      save: jest.fn().mockImplementation(async (value) => value),
    };
    const artworkRepository = {
      findOne: jest.fn().mockResolvedValue(artwork),
      save: jest.fn().mockImplementation(async (value) => value),
    };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === Order ? orderRepositoryInTransaction : artworkRepository,
      ),
    };
    const orderRepository = {
      find: jest.fn().mockResolvedValue([order]),
      manager: {
        transaction: jest.fn(async (callback) => callback(manager)),
      },
    } as unknown as Repository<Order>;
    const service = new OrdersService(
      orderRepository,
      {} as PayOSService,
      {} as never,
    );

    await service.expirePendingPayments();

    expect(order.paymentStatus).toBe(OrderPaymentStatus.EXPIRED);
    expect(order.status).toBe(OrderStatus.CANCELLED);
    expect(artwork.status).toBe(ArtworkStatus.ACTIVE);
  });
});
