import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SellerProfile } from './entities/seller_profile.entity';
import { SellerProfilesController } from './seller_profile.controller';
import { AdminSellerProfilesController } from './admin-seller-profile.controller';
import { SellerProfilesService } from './seller_profile.service';
import { NotificationModule } from '../../modules/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProfile]), NotificationModule],
  controllers: [SellerProfilesController, AdminSellerProfilesController],
  providers: [SellerProfilesService],
  exports: [SellerProfilesService],
})
export class SellerProfilesModule {}
