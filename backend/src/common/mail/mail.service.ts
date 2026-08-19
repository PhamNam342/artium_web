import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.getOrThrow<string>('SMTP_HOST');
    const port = Number(this.config.getOrThrow<string>('SMTP_PORT'));
    const secure = this.config.getOrThrow<string>('SMTP_SECURE') === 'true';
    const user = this.config.getOrThrow<string>('SMTP_USER');
    const pass = this.config.getOrThrow<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const user = this.config.getOrThrow<string>('SMTP_USER');

    await this.transporter.sendMail({
      from: `"Artium" <${user}>`,
      to: email,
      subject: 'Your verification code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });
  }
}
