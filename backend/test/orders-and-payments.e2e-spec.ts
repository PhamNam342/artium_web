import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../src/identity/user/entities/user.entity';
import { SellerProfile, VerificationStatus } from '../src/identity/seller_profile/entities/seller_profile.entity';
import { Artwork, ArtworkStatus } from '../src/modules/artworks/artwork.entity';
import { Order, OrderStatus, OrderPaymentStatus } from '../src/modules/orders/order.entity';
import { JwtService } from '@nestjs/jwt';
import { PayOSService } from '../src/modules/payments/payos.service';

describe('Orders & Payments (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  let sellerProfileRepository: Repository<SellerProfile>;
  let artworkRepository: Repository<Artwork>;
  let orderRepository: Repository<Order>;
  let jwtService: JwtService;

  let buyer: User;
  let seller: User;
  let artwork: Artwork;
  let buyerToken: string;
  let orderId: string;

  const mockPayOSService: any = {
    createPaymentLink: jest.fn().mockResolvedValue({
      checkoutUrl: 'http://mock-payos-checkout.com/123',
    }),
    verifyPaymentWebhookData: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PayOSService)
      .useValue(mockPayOSService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = app.get(getRepositoryToken(User));
    sellerProfileRepository = app.get(getRepositoryToken(SellerProfile));
    artworkRepository = app.get(getRepositoryToken(Artwork));
    orderRepository = app.get(getRepositoryToken(Order));
    jwtService = app.get(JwtService);

    // Create a seller
    seller = userRepository.create({
      email: 'seller.e2e@example.com',
      password: 'password',
      full_name: 'E2E Seller',
      role: UserRole.ARTIST,
      is_active: true,
    });
    await userRepository.save(seller);

    const sellerProfile = sellerProfileRepository.create({
      userId: seller.id,
      bio: 'E2E Bio',
      verificationStatus: VerificationStatus.APPROVED,
      isVerified: true,
      isVisible: true,
    });
    await sellerProfileRepository.save(sellerProfile);

    // Create an artwork for the seller
    artwork = artworkRepository.create({
      sellerId: seller.id,
      title: 'E2E Masterpiece',
      description: 'A beautiful painting for E2E testing',
      price: '150000',
      currency: 'VND',
      materials: 'Oil on canvas',
      dimensions: { width: 50, height: 70, unit: 'cm' },
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
    });
    await artworkRepository.save(artwork);

    // Create a buyer
    buyer = userRepository.create({
      email: 'buyer.e2e@example.com',
      password: 'password',
      full_name: 'E2E Buyer',
      role: UserRole.COLLECTOR,
      is_active: true,
    });
    await userRepository.save(buyer);

    // Generate token for buyer
    buyerToken = jwtService.sign({
      sub: buyer.id,
      email: buyer.email,
      role: buyer.role,
    });
  });

  afterAll(async () => {
    // Cleanup the database to avoid conflicts in future test runs
    await orderRepository.delete({});
    await artworkRepository.delete({ id: artwork.id });
    await sellerProfileRepository.delete({ userId: seller.id });
    await userRepository.delete({ id: seller.id });
    await userRepository.delete({ id: buyer.id });
    
    await app.close();
  });

  it('/orders (POST) - should create an order', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        artworkId: artwork.id,
        shippingAddress: '123 E2E Street, Testing City',
        shippingPhone: '0123456789',
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe(OrderStatus.PENDING);
    expect(response.body.artwork.id).toBe(artwork.id);
    
    orderId = response.body.id;

    // Verify artwork status changed to RESERVED
    const updatedArtwork = await artworkRepository.findOneBy({ id: artwork.id });
    expect(updatedArtwork?.status).toBe(ArtworkStatus.RESERVED);
  });

  it('/orders/:id/payment (POST) - should generate a payment link', async () => {
    const response = await request(app.getHttpServer())
      .post(`/orders/${orderId}/payment`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send()
      .expect(HttpStatus.CREATED);

    expect(response.body).toBeDefined();
    expect(response.body.checkoutUrl).toBe('http://mock-payos-checkout.com/123');
    expect(mockPayOSService.createPaymentLink).toHaveBeenCalled();
  });

  it('/payments/payos/webhook (POST) - should process successful payment', async () => {
    // Determine how order code is generated (usually a number derived from orderId or a separate field)
    // Looking at common PayOS integrations, orderCode is sent in the webhook.
    // Let's fetch the order to get its code.
    const order = await orderRepository.findOneBy({ id: orderId });
    expect(order).toBeDefined();

    const webhookPayload = {
      code: "00",
      desc: "Success",
      data: {
        orderCode: order?.payosOrderCode || Number(orderId.replace(/\D/g, '').slice(-10)), // fallback logic
        amount: order?.totalAmount || 150000,
        description: "Payment for order",
        accountNumber: "123",
        reference: "REF123",
        transactionDateTime: new Date().toISOString(),
        currency: "VND",
        paymentLinkId: "link123",
      },
      signature: "dummy_signature", // In real scenario PayOS validates this, might need to mock verify webhook if it fails
    };

    // If the actual webhook validation happens in handlePayOSWebhook, we might need to override it or skip validation
    // Since we mock PayOSService, we should mock verifyPaymentWebhookData if it exists.
    mockPayOSService.verifyPaymentWebhookData.mockReturnValue(webhookPayload.data);

    await request(app.getHttpServer())
      .post('/payments/payos/webhook')
      .send(webhookPayload)
      .expect(HttpStatus.OK);

    // Verify order payment status is PAID
    const updatedOrder = await orderRepository.findOneBy({ id: orderId });
    expect(updatedOrder?.paymentStatus).toBe(OrderPaymentStatus.PAID);

    // Verify artwork status is SOLD
    const updatedArtwork = await artworkRepository.findOneBy({ id: artwork.id });
    expect(updatedArtwork?.status).toBe(ArtworkStatus.SOLD);
  });

  it('/orders (GET) - should list user orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].id).toBe(orderId);
  });
});
