import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);

  async sendEmail(
    to: { email: string; name?: string }[],
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@mini-logistic.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Mini Supply Chain';

    if (!apiKey || apiKey === 'your-brevo-api-key-here') {
      this.logger.warn('BREVO_API_KEY is not defined or is placeholder. Skipping email sending.');
      // Print the email content to console for local developer debugging/verification
      this.logger.debug(`[MOCK EMAIL SENT]
To: ${JSON.stringify(to)}
Subject: ${subject}
Content: ${htmlContent}`);
      return true;
    }

    const postData = JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to,
      subject,
      htmlContent,
    });

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            this.logger.log(`Email sent successfully: ${subject}`);
            resolve(true);
          } else {
            this.logger.error(`Failed to send email via Brevo. Status: ${res.statusCode}, Body: ${body}`);
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`Error sending email via Brevo: ${e.message}`);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }
}
