import { Injectable } from '@nestjs/common'
import { createTransport, TransPorter } from 'nodemailer'

@Injectable()
export class EmailService {
  transporter: TransPorter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '290506494@qq.com',
        pass: '授权码'
      }
    })
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: '290506494@qq.com'
      },
      to,
      subject,
      html
    })
  }
}
