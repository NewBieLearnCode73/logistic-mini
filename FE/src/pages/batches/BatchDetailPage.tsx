import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { RoleName, BatchStatus, formatCurrency } from '../../utils/constants';
import {
  useBatchDetail,
  useBatchTimeline,
  useSellBatch,
  useRegenerateQR,
} from '../../hooks/queries/useBatches';
import TimelineStepper from '../../components/domain/TimelineStepper';
import QRDisplay from '../../components/domain/QRDisplay';
import FormModal from '../../components/ui/FormModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getRole, getNodeId } = useAuthStore();

  const role = getRole();
  const currentUserNodeId = getNodeId();
  const isAdmin = role === RoleName.ADMIN;
  const isRetailer = role === RoleName.RETAILER;
  const isManufacturer = role === RoleName.MANUFACTURER;

  // React Query queries
  const { data: batch, isLoading, isError } = useBatchDetail(id || '');
  const { data: timeline, isLoading: isTimelineLoading } = useBatchTimeline(id || '');
  
  const sellMutation = useSellBatch();
  const regenerateMutation = useRegenerateQR();

  // Modals state
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState('');
  const [sellError, setSellError] = useState('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [salePriceError, setSalePriceError] = useState('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [costPriceError, setCostPriceError] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-4">
        <div className="h-6 w-20 rounded bg-zinc-100 dark:bg-zinc-900/60" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="h-40 rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
            <div className="h-60 rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
          </div>
          <div className="h-80 rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
        </div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <span className="text-4xl mb-2">❌</span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t('batch.notFound')}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          {t('batch.notFoundDesc')}
        </p>
        <button onClick={() => navigate('/batches')} className="btn-secondary mt-4">
          {t('batch.backToList')}
        </button>
      </div>
    );
  }

  const handleOpenSell = () => {
    const defaultCostPrice = batch?.product?.unitPrice || 0;

    setSellQuantity(1);
    setCostPrice(Number(defaultCostPrice));
    setSalePrice(Number(defaultCostPrice));
    setSaleDate(new Date().toISOString().split('T')[0]);
    setSellError('');
    setSalePriceError('');
    setCostPriceError('');
    setIsSellOpen(true);
  };

  const handleQuantityChange = (val: string) => {
    const qty = parseFloat(val);
    setSellQuantity(qty);
    if (isNaN(qty) || qty <= 0) {
      setSellError(t('batch.sellQuantityError'));
    } else if (!isAdmin && batch.localInventory && qty > batch.localInventory.quantityAvailable) {
      setSellError(t('batch.sellQuantityExceedsAvailable'));
    } else {
      setSellError('');
    }
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    setSellError('');
    setSalePriceError('');
    setCostPriceError('');

    if (isNaN(sellQuantity) || sellQuantity <= 0) {
      setSellError(t('batch.sellQuantityError'));
      hasError = true;
    } else if (!isAdmin && batch.localInventory && sellQuantity > batch.localInventory.quantityAvailable) {
      setSellError(t('batch.sellQuantityExceedsAvailable'));
      hasError = true;
    }

    if (costPrice === '' || isNaN(Number(costPrice)) || Number(costPrice) <= 0) {
      setCostPriceError(t('batch.validation.costPriceMin'));
      hasError = true;
    }

    if (salePrice === '' || isNaN(Number(salePrice)) || Number(salePrice) <= 0) {
      setSalePriceError(t('batch.validation.salePriceMin'));
      hasError = true;
    }

    if (costPrice !== '' && salePrice !== '' && Number(salePrice) < Number(costPrice)) {
      setSalePriceError(t('batch.validation.salePriceGteCost'));
      hasError = true;
    }

    if (hasError) return;
    
    sellMutation.mutate(
      {
        id: batch.id,
        quantity: Number(sellQuantity),
        saleDate: (() => {
          if (!saleDate) return undefined;
          const parts = saleDate.split('-');
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          const date = new Date();
          date.setFullYear(y, m, d);
          return date.toISOString();
        })(),
        salePrice: Number(salePrice),
        costPrice: Number(costPrice),
      },
      {
        onSuccess: () => {
          setIsSellOpen(false);
        },
      }
    );
  };

  const handleRegenerateQR = () => {
    regenerateMutation.mutate(batch.id);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  // Determine permissions
  const canRegenerate = isAdmin || (isManufacturer && batch.originNodeId === currentUserNodeId);
  
  // Can sell if active, and role is Admin or Retailer
  const isStatusSellable =
    batch.status !== BatchStatus.SOLD &&
    batch.status !== BatchStatus.LOST &&
    batch.status !== BatchStatus.DISCARDED;
  const hasLocalStock = isAdmin || (batch.localInventory && batch.localInventory.quantityAvailable > 0);
  const canSell = (isAdmin || isRetailer) && isStatusSellable && hasLocalStock;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/batches')}
          className="btn-ghost flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150 pl-0"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{t('batch.backToList')}</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Detail & Timeline (Left column) */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Card: Batch details */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3 dark:border-zinc-800/40">
              <div>
                <span className="text-2xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
                  {t('batch.batchCode')}
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                  {batch.batchCode}
                </h2>
              </div>
              <StatusBadge status={batch.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.product')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {batch.product?.name} ({batch.product?.sku})
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.quantity')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {batch.quantity} {batch.unit}
                </span>
              </div>
              {!isAdmin && batch.localInventory !== undefined && (
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.localInventory')}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {batch.localInventory ? batch.localInventory.quantityAvailable : 0} {batch.unit}
                  </span>
                </div>
              )}
              {(isAdmin || isRetailer) && (
                <>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('product.unitPrice')}</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(batch.product?.unitPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.totalValue')}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(batch.totalValue)}
                    </span>
                  </div>
                </>
              )}
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.manufactureDate')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatDate(batch.manufactureDate)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.expiryDate')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatDate(batch.expiryDate)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.origin')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {batch.originNode?.name || '-'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-2xs">{t('batch.currentLocation')}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {batch.currentNode?.name || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Admin Inventory Distribution */}
          {isAdmin && batch.inventories && batch.inventories.length > 0 && (
            <div className="card space-y-4">
              <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200/50 pb-2 dark:border-zinc-800/40">
                {t('batch.inventoryDistribution')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-left">
                      <th className="pb-2 font-medium">{t('node.name')}</th>
                      <th className="pb-2 font-medium">{t('node.type')}</th>
                      <th className="pb-2 font-medium text-right">{t('product.quantity')}</th>
                      <th className="pb-2 font-medium text-right">{t('batch.lastUpdated')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.inventories.map((inv) => (
                      <tr key={inv.nodeId} className="border-b border-zinc-100 dark:border-zinc-900/50 last:border-0">
                        <td className="py-2 text-zinc-900 dark:text-zinc-150 font-medium">
                          {inv.node?.name || t('common.unknown')}
                        </td>
                        <td className="py-2 text-zinc-500 dark:text-zinc-400">
                          {inv.node?.nodeType ? t(`node.types.${inv.node.nodeType}`) : '-'}
                        </td>
                        <td className="py-2 text-right font-mono text-zinc-900 dark:text-zinc-150 font-semibold">
                          {inv.quantityAvailable} {batch.unit}
                        </td>
                        <td className="py-2 text-right text-zinc-400 dark:text-zinc-500">
                          {formatDate(inv.lastUpdatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card: Journey Timeline */}
          <div className="card space-y-4">
            <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200/50 pb-2 dark:border-zinc-800/40">
              {t('timeline.title')}
            </h3>
            <TimelineStepper events={timeline} loading={isTimelineLoading} />
          </div>
        </div>

        {/* QR Display & Actions panel (Right column) */}
        <div className="space-y-4">
          <QRDisplay
            qrCode={batch.qrCode}
            batchCode={batch.batchCode}
            productName={batch.product?.name || ''}
            onRegenerate={handleRegenerateQR}
            canRegenerate={canRegenerate}
            regenerating={regenerateMutation.isPending}
          />

          {canSell && (
            <div className="card">
              <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                {t('batch.retailSell')}
              </h4>
              <p className="text-2xs text-zinc-500 dark:text-zinc-400 mb-4">
                {t('batch.retailSellDesc')}
              </p>
              <button
                onClick={handleOpenSell}
                className="btn-primary w-full flex items-center justify-center gap-1.5 py-2"
              >
                <ShoppingBagIcon className="h-4 w-4" />
                <span>{t('batch.sellBatch')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sell Modal */}
      {canSell && (
        <FormModal
          isOpen={isSellOpen}
          onClose={() => setIsSellOpen(false)}
          title={t('batch.retailSell')}
          size="sm"
        >
          <form onSubmit={handleSellSubmit} className="space-y-4">
            <p className="text-2xs text-zinc-500 dark:text-zinc-400">
              {t('batch.retailSellDesc')} (<strong>{t('batch.unit')}: {batch.unit}</strong>)
            </p>
            {!isAdmin && batch.localInventory && (
              <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 p-2 rounded text-2xs font-medium">
                {t('batch.localInventory')}: {batch.localInventory.quantityAvailable} {batch.unit}
              </div>
            )}

             <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t('batch.sellQuantity')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.001"
                step="any"
                value={sellQuantity || ''}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`input-field ${sellError ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="10"
                required
                autoFocus
              />
              {sellError && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{sellError}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t('batch.sellDate')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t('batch.costPrice')} ({batch.unit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={costPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setCostPrice(val === '' ? '' : Number(val));
                  setCostPriceError('');
                }}
                className={`input-field ${costPriceError ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="10000"
                required
              />
              {costPriceError && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{costPriceError}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t('batch.salePrice')} ({batch.unit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={salePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setSalePrice(val === '' ? '' : Number(val));
                  setSalePriceError('');
                }}
                className={`input-field ${salePriceError ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="15000"
                required
              />
              {salePriceError && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{salePriceError}</p>
              )}
            </div>

            {/* Profit Preview */}
            {sellQuantity > 0 && costPrice !== '' && salePrice !== '' && (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/40 text-xs space-y-1.5">
                <h5 className="font-semibold text-zinc-700 dark:text-zinc-300 text-2xs uppercase tracking-wider mb-1">
                  {t('batch.profitPreview')}
                </h5>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('batch.costPriceLabel')}:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(Number(costPrice))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('batch.salePriceLabel')}:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(Number(salePrice))}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/50 dark:border-zinc-800/40 pt-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('batch.totalRevenue')}:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(sellQuantity * Number(salePrice))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('batch.totalCost')}:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(sellQuantity * Number(costPrice))}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/50 dark:border-zinc-800/40 pt-1.5 font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">{t('batch.estimatedProfit')}:</span>
                  <span className={`font-bold ${(sellQuantity * Number(salePrice)) - (sellQuantity * Number(costPrice)) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency((sellQuantity * Number(salePrice)) - (sellQuantity * Number(costPrice)))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40">
              <button
                type="button"
                onClick={() => setIsSellOpen(false)}
                className="btn-secondary py-1.5"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={sellMutation.isPending}
                className="btn-primary py-1.5"
              >
                {sellMutation.isPending ? t('common.loading') : t('batch.confirmSell')}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
}
