import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UploadModule } from './../../modules/upload/upload.module';
import { SellerProfile } from '../seller_profile/entities/seller_profile.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, SellerProfile]), UploadModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
