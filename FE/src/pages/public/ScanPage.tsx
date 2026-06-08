import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '../../api/batches.api';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { CommandLineIcon, CameraIcon, StopIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function ScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [batchCode, setBatchCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Retrieve actual batches for dev simulator if user is logged in
  const { data: batchesData } = useQuery({
    queryKey: ['batches-simulator'],
    queryFn: () => batchesApi.getList({ page: 1, limit: 50 }).then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const handleScanSuccess = async (decodedText: string) => {
    // Standard format checks if any, or just navigate to trace
    let cleanedText = decodedText.trim();
    if (cleanedText) {
      if (cleanedText.startsWith('http://') || cleanedText.startsWith('https://')) {
        try {
          const url = new URL(cleanedText);
          const pathParts = url.pathname.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart) {
            cleanedText = lastPart;
          }
        } catch (e) {
          console.error('Failed to parse scanned URL:', e);
        }
      }
      toast.success(t('common.success'));
      await stopScanner();
      navigate(`/trace/${cleanedText}`);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);
    // Give react time to render container
    setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode(scannerContainerId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Silence frame parsing failures
          }
        );
      } catch (err: any) {
        console.error('Camera startup error:', err);
        setCameraError(
          err?.message || 'Không thể truy cập camera. Vui lòng cấp quyền hoặc nhập thủ công.'
        );
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    html5QrcodeRef.current = null;
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCode.trim()) {
      navigate(`/trace/${batchCode.trim()}`);
    }
  };

  useEffect(() => {
    return () => {
      // Ensure scanner is stopped on unmount
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {t('public.scanTitle')}
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
          {t('public.scanSubtitle')}
        </p>
      </div>

      {/* Video Scanner Container */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/40 aspect-square flex flex-col items-center justify-center p-4">
        {isScanning ? (
          <div className="w-full h-full relative">
            <div id={scannerContainerId} className="w-full h-full rounded-lg overflow-hidden" />
            {/* Animated Laser Overlay */}
            <div className="absolute inset-x-8 top-1/2 h-[1.5px] bg-emerald-500/80 dark:bg-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse pointer-events-none" />
            <button
              onClick={stopScanner}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2.5 shadow-md flex items-center gap-1.5 text-2xs font-semibold transition-colors"
            >
              <StopIcon className="h-4 w-4" />
              <span>Dừng quét</span>
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 p-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <CameraIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-2xs font-semibold text-zinc-800 dark:text-zinc-200">
                Camera chưa kích hoạt
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-[220px] mx-auto">
                Nhấn nút bên dưới để cấp quyền camera và quét mã vạch sản phẩm.
              </p>
            </div>
            <button
              onClick={startScanner}
              className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
            >
              <CameraIcon className="h-4 w-4" />
              <span>{t('public.openCamera')}</span>
            </button>
            {cameraError && (
              <p className="text-3xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200/20">
                {cameraError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <div className="card space-y-3">
        <h2 className="text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          {t('public.manualInput')}
        </h2>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="e.g. BATCH-MFR-1716..."
            className="input-field py-2 text-xs flex-1 font-mono uppercase"
            required
          />
          <button type="submit" className="btn-primary py-2 px-4 text-xs font-semibold">
            Tra cứu
          </button>
        </form>
      </div>

      {/* Dev Simulator Panel (Visible to logged-in users only) */}
      {isAuthenticated && (
        <div className="card border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/5 space-y-3">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
            <CommandLineIcon className="h-4 w-4" />
            <h3 className="text-2xs font-bold uppercase tracking-wider">
              Developer Sandbox Simulator
            </h3>
          </div>
          <p className="text-3xs text-zinc-400 dark:text-zinc-500">
            Mô phỏng quét mã nhanh bằng cách chọn trực tiếp các lô hàng thực tế đang có trong hệ thống (chỉ hiển thị ở chế độ Sandbox khi đã đăng nhập).
          </p>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-zinc-200/50 dark:border-zinc-800/40 rounded p-1.5 bg-white dark:bg-zinc-950">
            {batchesData?.data && batchesData.data.length > 0 ? (
              batchesData.data.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/trace/${b.batchCode}`)}
                  className="w-full text-left p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded flex items-center justify-between text-3xs border-b border-zinc-200/50 dark:border-zinc-800/40 last:border-b-0 transition-colors"
                >
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                    {b.batchCode}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 truncate max-w-[150px]">
                    {b.product?.name} ({b.quantity} {b.unit})
                  </span>
                </button>
              ))
            ) : (
              <p className="text-3xs text-zinc-500 p-2 text-center">Không tìm thấy lô hàng nào</p>
            )}
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-1 text-3xs text-zinc-400 dark:text-zinc-500">
        <ShieldCheckIcon className="h-3.5 w-3.5" />
        <span>Hệ thống truy xuất nguồn gốc được bảo mật và xác thực chuỗi.</span>
      </div>
    </div>
  );
}
