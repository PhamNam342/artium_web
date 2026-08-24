import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { PayOSModule } from './payos.module';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [OrdersModule, PayOSModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
