import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null = null;
  private static instance: MailService | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend client initialized successfully.');
    } else {
      this.logger.warn('RESEND_API_KEY is not defined. Falling back to console logging.');
    }
    MailService.instance = this;
  }

  static getInstance(): MailService | null {
    return MailService.instance;
  }

  async sendVerificationEmail(email: string, name: string, url: string): Promise<boolean> {
    const subject = 'Verify your email address';
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Verify your email address</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering on Epoch. Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 24px 0;">
          <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${url}</p>
      </div>
    `;

    if (this.resend) {
      try {
        const fromEmail = this.configService.get<string>('MAIL_FROM') || 'Epoch <onboarding@resend.dev>';
        await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject,
          html,
        });
        this.logger.log(`Verification email successfully sent to ${email} via Resend.`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${email} via Resend`, error);
      }
    }

    // Fallback: beautiful terminal console log
    console.log('\n' + '='.repeat(80));
    console.log(`[DEVELOPMENT EMAIL VERIFICATION PIPELINE]`);
    console.log(`TO: ${name} <${email}>`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`LINK: ${url}`);
    console.log('='.repeat(80) + '\n');

    return true;
  }

  async sendResetPasswordEmail(email: string, name: string, url: string): Promise<boolean> {
    const subject = 'Reset your password';
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Reset your password</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password on Epoch. Please click the button below to reset your password:</p>
        <div style="margin: 24px 0;">
          <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${url}</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    if (this.resend) {
      try {
        const fromEmail = this.configService.get<string>('MAIL_FROM') || 'Epoch <onboarding@resend.dev>';
        await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject,
          html,
        });
        this.logger.log(`Password reset email successfully sent to ${email} via Resend.`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${email} via Resend`, error);
      }
    }

    // Fallback: beautiful terminal console log
    console.log('\n' + '='.repeat(80));
    console.log(`[DEVELOPMENT PASSWORD RESET PIPELINE]`);
    console.log(`TO: ${name} <${email}>`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`LINK: ${url}`);
    console.log('='.repeat(80) + '\n');

    return true;
  }
}
