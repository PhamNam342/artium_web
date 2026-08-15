import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './database/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Bắt đầu chạy Seeder...');

  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  try {
    const adminEmail = 'admin@artium.com';
    const exists = await userRepository.findOneBy({ email: adminEmail });

    if (!exists) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      const admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
      });
      await userRepository.save(admin);
      console.log(`✅ Đã tạo tài khoản Admin: ${adminEmail}`);
    } else {
      console.log('⚠️ Tài khoản Admin đã tồn tại. Bỏ qua.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi chạy Seeder:', error);
  } finally {
    await app.close();
    console.log('🏁 Seeder hoàn tất.');
  }
}

bootstrap();
