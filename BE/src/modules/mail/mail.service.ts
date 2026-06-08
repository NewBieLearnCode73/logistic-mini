import { Injectable, Logger } from '@nestjs/common';
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailApi: TransactionalEmailsApi;

  constructor() {
    this.emailApi = new TransactionalEmailsApi();
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      this.emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
      this.logger.log('Brevo API key configured successfully');
    } else {
      this.logger.warn('BREVO_API_KEY is not defined in the environment variables');
    }
  }

  async sendTemporaryPassword(toEmail: string, temporaryPassword: string): Promise<any> {
    const senderName = process.env.ADMIN_EMAIL_NAME || 'Anh Thắng Đẹp Trai';
    const senderEmail = process.env.ADMIN_EMAIL_ADDRESS || 'thang.huynhduc.learning@gmail.com';

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = 'Chào mừng bạn đến với Hệ thống Logistics Mini - Mật khẩu tạm thời';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Chào mừng thành viên mới!</h2>
        <p>Tài khoản nhân sự của bạn đã được tạo thành công trên hệ thống <strong>Logistics Mini</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #475569;">Thông tin đăng nhập của bạn:</p>
          <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">Email: ${toEmail}</p>
          <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">Mật khẩu tạm thời: <span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</span></p>
        </div>
        <p style="color: #ef4444; font-size: 13px; font-weight: 500;">* Lưu ý: Hãy đổi mật khẩu ngay sau khi đăng nhập thành công để đảm bảo an toàn bảo mật.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">Báo cáo tự động từ Hệ thống Logistics Mini</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: toEmail }];

    try {
      this.logger.log(`Sending temporary password email to ${toEmail}...`);
      const response = await this.emailApi.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email sent successfully to ${toEmail}.`);
      return response;
    } catch (error: any) {
      const errorBody = error.body || error.response?.body || error.response?.data;
      this.logger.error(
        `Failed to send email to ${toEmail}: ${error.message}`,
        errorBody ? JSON.stringify(errorBody) : error.stack,
      );
    }
  }

  async sendResetPassword(toEmail: string, newPassword: string): Promise<any> {
    const senderName = process.env.ADMIN_EMAIL_NAME || 'Anh Thắng Đẹp Trai';
    const senderEmail = process.env.ADMIN_EMAIL_ADDRESS || 'thang.huynhduc.learning@gmail.com';

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = 'Mật khẩu tài khoản của bạn đã được cấp lại - Logistics Mini';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <h2 style="color: #f59e0b; margin-top: 0;">Mật khẩu đã được cấp lại</h2>
        <p>Quản trị viên hệ thống đã tiến hành cấp lại mật khẩu cho tài khoản <strong>Logistics Mini</strong> của bạn.</p>
        <div style="background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #475569;">Thông tin đăng nhập mới:</p>
          <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">Email: ${toEmail}</p>
          <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">Mật khẩu mới: <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${newPassword}</span></p>
        </div>
        <p style="color: #ef4444; font-size: 13px; font-weight: 500;">* Lưu ý: Hãy đổi mật khẩu ngay sau khi đăng nhập thành công để đảm bảo an toàn bảo mật.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">Báo cáo tự động từ Hệ thống Logistics Mini</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: toEmail }];

    try {
      this.logger.log(`Sending reset password email to ${toEmail}...`);
      const response = await this.emailApi.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Reset password email sent successfully to ${toEmail}.`);
      return response;
    } catch (error: any) {
      const errorBody = error.body || error.response?.body || error.response?.data;
      this.logger.error(
        `Failed to send reset password email to ${toEmail}: ${error.message}`,
        errorBody ? JSON.stringify(errorBody) : error.stack,
      );
    }
  }
}
