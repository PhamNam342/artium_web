import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SellerProfile } from './entities/seller_profile.entity';
import { SellerProfilesController } from './seller_profile.controller';
import { SellerProfilesService } from './seller_profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProfile])],
  controllers: [SellerProfilesController],
  providers: [SellerProfilesService],
  exports: [SellerProfilesService],
})
export class SellerProfilesModule {}
