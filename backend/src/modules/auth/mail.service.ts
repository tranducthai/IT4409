import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) { }

  private getTransport() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      throw new InternalServerErrorException('SMTP is not configured');
    }

    return nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    });
  }

  private getFromAddress(): string {
    return (
      this.configService.get<string>('SMTP_FROM') ??
      this.configService.get<string>('SMTP_USER') ??
      'no-reply@example.com'
    );
  }

  async sendPasswordReset(email: string, name: string, link: string) {
    const transporter = this.getTransport();
    await transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject: 'Reset your password',
      text: `Hi ${name},\n\nPlease reset your password using this link: ${link}\n\nIf you did not request this, you can ignore this email.`,
    });
  }
}
