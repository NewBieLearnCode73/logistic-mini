import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  async generateSvg(url: string): Promise<string> {
    try {
      return await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'H',
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Không thể sinh mã QR dạng SVG: ${error.message}`,
      );
    }
  }

  async generatePngDataUrl(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        width: 512,
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Không thể sinh mã QR dạng ảnh PNG: ${error.message}`,
      );
    }
  }
}
