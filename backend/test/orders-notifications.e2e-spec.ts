import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { as, createE2eApp, ids } from './e2e-helpers';

describe('Notifications, orders and payments API (e2e)', () => {
  let app: INestApplication<App>;
  let mocks: Awaited<ReturnType<typeof createE2eApp>>['mocks'];

  beforeAll(async () => ({ app, mocks } = await createE2eApp()));
  afterAll(async () => app.close());

  it('lists and updates notification read state', async () => {
    await request(app.getHttpServer()).get('/api/notifications').set(as('collector-token')).expect(200);
    await request(app.getHttpServer()).get('/api/notifications/unread-count').set(as('collector-token')).expect(200, { unreadCount: 1 });
    await request(app.getHttpServer()).get('/api/notifications/notification-1').set(as('collector-token')).expect(200);
    await request(app.getHttpServer()).put('/api/notifications/notification-1/read').set(as('collector-token')).expect(200);
    await request(app.getHttpServer()).put('/api/notifications/read-all').set(as('collector-token')).expect(200);
    await request(app.getHttpServer()).post('/api/notifications/test').set(as('collector-token')).expect(201);
  });

  it('validates and creates an order for the authenticated collector', async () => {
    const shippingAddress = { fullName: 'Collector', addressLine1: '1 Art Street', city: 'Ho Chi Minh City', country: 'VN' };
    await request(app.getHttpServer()).post('/api/orders').set(as('collector-token')).send({ artworkId: ids.artwork }).expect(400);
    await request(app.getHttpServer()).post('/api/orders').set(as('collector-token')).send({ artworkId: ids.artwork, shippingAddress }).expect(201, { id: ids.order });
    expect(mocks.orders.createOrder).toHaveBeenLastCalledWith(ids.collector, { artworkId: ids.artwork, shippingAddress });
  });

  it('lists, reads, updates and pays for orders', async () => {
    await request(app.getHttpServer()).get('/api/orders').set(as('collector-token')).expect(200, []);
    await request(app.getHttpServer()).get(`/api/orders/${ids.order}`).set(as('collector-token')).expect(200, { id: ids.order });
    await request(app.getHttpServer()).put(`/api/orders/${ids.order}`).set(as('admin-token')).send({ status: 'CANCELLED' }).expect(200);
    await request(app.getHttpServer()).post(`/api/orders/${ids.order}/payment`).set(as('collector-token')).expect(201);
    await request(app.getHttpServer()).post(`/api/orders/${ids.order}/payment/cancel`).set(as('collector-token')).expect(201);
  });

  it('accepts PayOS webhooks without user authentication', async () => {
    await request(app.getHttpServer()).post('/api/payments/payos/webhook').send({ code: '00', data: { orderCode: 1 } }).expect(200, { success: true });
    expect(mocks.orders.handlePayOSWebhook).toHaveBeenCalledTimes(1);
  });
});
