import { ArrowDownTrayIcon, PrinterIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { BatchQrCode } from '../../types/batch.types';
import { useTranslation } from 'react-i18next';

interface QRDisplayProps {
  qrCode: BatchQrCode | null;
  batchCode: string;
  productName: string;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
  regenerating?: boolean;
}

export default function QRDisplay({
  qrCode,
  batchCode,
  productName,
  onRegenerate,
  canRegenerate = false,
  regenerating = false,
}: QRDisplayProps) {
  const { t } = useTranslation();

  if (!qrCode) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
        <span className="text-3xl mb-2">⚠️</span>
        <h4 className="text-[13px] font-semibold text-text-primary">{t('qr.noQrTitle')}</h4>
        <p className="mt-1 text-2xs text-text-muted max-w-[180px]">
          {t('qr.noQrDesc')}
        </p>
        {canRegenerate && onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="btn-primary mt-3 text-2xs py-1"
          >
            {regenerating ? t('qr.generating') : t('qr.initQr')}
          </button>
        )}
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('qr.printTitle')} - ${batchCode}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              text-align: center;
              padding: 0;
              margin: 0;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .label-card {
              border: 2px solid #000;
              border-radius: 12px;
              padding: 24px;
              display: inline-block;
              width: 280px;
              box-sizing: border-box;
            }
            .qr-image {
              width: 220px;
              height: 220px;
              display: block;
              margin: 0 auto;
            }
            .title {
              font-size: 15px;
              font-weight: 600;
              margin-top: 14px;
              color: #000;
              word-break: break-word;
              line-height: 1.3;
            }
            .subtitle {
              font-size: 12px;
              color: #333;
              margin-top: 6px;
              font-family: monospace;
              letter-spacing: 0.5px;
            }
            .footer {
              font-size: 9px;
              color: #666;
              margin-top: 12px;
              border-top: 1px dashed #ccc;
              padding-top: 8px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <img class="qr-image" src="${qrCode.qrImageUrl}" alt="QR Code" />
            <div class="title">${productName}</div>
            <div class="subtitle">${batchCode}</div>
            <div class="footer">${t('qr.traceSystem')}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="card flex flex-col items-center justify-center p-6 text-center">
      {/* QR Code base64 image */}
      <div className="relative group rounded-md border border-border p-4 bg-muted">
        <img
          src={qrCode.qrImageUrl}
          alt={`${t('qr.qrTitle')} - ${batchCode}`}
          className="h-44 w-44 object-contain select-none"
        />
      </div>

      <div className="mt-4 w-full">
        <h4 className="text-[13px] font-semibold text-text-primary">
          {t('qr.qrTitle')}
        </h4>
        <p className="mt-0.5 text-2xs font-mono text-text-muted truncate select-all">
          {batchCode}
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2 w-full">
        {/* HTML5 download trigger */}
        <a
          href={qrCode.qrImageUrl}
          download={`QR-${batchCode}.png`}
          className="btn-secondary flex items-center justify-center gap-1.5 text-2xs py-1.5"
        >
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
          <span>{t('qr.downloadPng')}</span>
        </a>
        <button
          onClick={handlePrint}
          className="btn-secondary flex items-center justify-center gap-1.5 text-2xs py-1.5"
        >
          <PrinterIcon className="h-3.5 w-3.5" />
          <span>{t('qr.printLabel')}</span>
        </button>
      </div>

      {canRegenerate && onRegenerate && (
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="btn-ghost flex items-center justify-center gap-1.5 text-2xs mt-4 w-full text-text-muted hover:text-text-primary"
        >
          <ArrowPathIcon className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          <span>{t('qr.regenerate')}</span>
        </button>
      )}
    </div>
  );
}
