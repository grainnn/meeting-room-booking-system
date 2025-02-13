import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('proxy_email'),
        pass: this.configService.get('proxy_email_auth')
      }
    });
  }

  async sendMail({ to, subject, html }) {
    console.log(this.configService.get('proxy_email'));
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: this.configService.get('proxy_email') as string
      },
      to: to as string,
      subject: subject as string,
      html: html as string
    });
  }
}
