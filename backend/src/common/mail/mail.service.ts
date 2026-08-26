import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>('BREVO_API_KEY');
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const body = {
      sender: {
        name: 'Artium',
        email: 'nam1234kan@gmail.com', // Thay bằng email tài khoản Brevo của bạn
      },
      to: [{ email: email }],
      subject: 'Your verification code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Mã xác nhận tài khoản Artium</h2>
          <p>Mã OTP của bạn là:</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
          <p>Mã này có hiệu lực trong vòng 5 phút.</p>
        </div>
      `,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email via Brevo: ${errorText}`);
    }
  }
}
