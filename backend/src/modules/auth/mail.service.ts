import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendVerificationCode(email: string, code: string) {
    const html = `<div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><h2 style="color:#1f2937;margin-bottom:8px">LinguaCraft</h2><p style="color:#4b5563;font-size:16px;line-height:1.6">您的验证码是：</p><div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:center;margin:16px 0"><span style="font-size:32px;font-weight:700;letter-spacing:6px;color:#1f2937">${code}</span></div><p style="color:#9ca3af;font-size:14px">5分钟内有效，请勿分享给他人。</p></div>`

    const hasSmtp = process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@qq.com'

    if (!hasSmtp) {
      console.log(`\n[DEV] ============================================`)
      console.log(`[DEV] 验证码 for ${email}: ${code}`)
      console.log(`[DEV] (配置 SMTP 后可通过邮件发送)`)
      console.log(`[DEV] ============================================\n`)
      return
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'LinguaCraft - 邮箱验证码',
      html
    })
  }
}
