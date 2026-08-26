import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    await this.resend.emails.send({
      // Nếu chưa cấu hình domain riêng trên Resend, bạn có thể dùng 'onboarding@resend.dev' để test
      from: 'Artium <onboarding@resend.dev>',
      to: [email],
      subject: 'Your verification code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Mã xác nhận tài khoản Artium</h2>
          <p>Mã OTP của bạn là:</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
          <p>Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ cho người khác.</p>
        </div>
      `,
    });
  }
}
