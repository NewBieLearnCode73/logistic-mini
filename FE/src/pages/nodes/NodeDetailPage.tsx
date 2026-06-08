import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNodeDetail } from '../../hooks/queries/useNodes';
import { formatCurrency, RoleName } from '../../utils/constants';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getRole } = useAuthStore();
  const role = getRole();
  const isAdmin = role === RoleName.ADMIN;

  const { data: node, isLoading, isError } = useNodeDetail(id || '');

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

  if (isError || !node) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <span className="text-4xl mb-2">❌</span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t('node.notFound')}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          {t('node.notFoundDesc')}
        </p>
        <button
          onClick={() => navigate(isAdmin ? '/nodes' : '/dashboard')}
          className="btn-secondary mt-4"
        >
          {isAdmin ? t('node.backToList') : t('sidebar.dashboard')}
        </button>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalProducts = node.inventory?.length || 0;
  const totalUnits = node.inventory?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;
  const totalValue = node.inventory?.reduce((sum: number, item: any) => sum + (item.totalValue || 0), 0) || 0;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate(isAdmin ? '/nodes' : '/dashboard')}
          className="btn-ghost flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150 pl-0 py-1"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{isAdmin ? t('node.backToList') : t('sidebar.dashboard')}</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <span className="text-2xs uppercase tracking-wider text-text-muted font-bold block">
            {t('node.details')}
          </span>
          <h1 className="page-title text-[32px] md:text-[38px] leading-tight font-bold">
            {node.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20`}>
            {t(`node.types.${node.nodeType}`) || node.nodeType}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              node.isActive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {node.isActive ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Node Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="card space-y-5">
            <h2 className="card-title text-[18px] font-semibold border-b border-border pb-3">
              {t('common.info', 'Thông tin điểm')}
            </h2>
            <div className="space-y-4 text-[13px] leading-relaxed">
              <div>
                <span className="text-text-muted block text-2xs uppercase font-semibold tracking-wider">{t('node.name')}</span>
                <span className="font-semibold text-text-primary text-[15px]">{node.name}</span>
              </div>
              <div>
                <span className="text-text-muted block text-2xs uppercase font-semibold tracking-wider">{t('node.nodeType')}</span>
                <span className="font-medium text-text-secondary">{t(`node.types.${node.nodeType}`) || node.nodeType}</span>
              </div>
              <div>
                <span className="text-text-muted block text-2xs uppercase font-semibold tracking-wider">{t('node.address')}</span>
                <span className="font-medium text-text-secondary">{node.address || '—'}</span>
              </div>
              <div>
                <span className="text-text-muted block text-2xs uppercase font-semibold tracking-wider">{t('node.coordinates')}</span>
                <span className="font-medium text-text-secondary font-mono">
                  {node.latitude !== null && node.longitude !== null
                    ? `${node.latitude.toFixed(6)}, ${node.longitude.toFixed(6)}`
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-2xs uppercase font-semibold tracking-wider">{t('common.status')}</span>
                <span className={`font-semibold ${node.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                  {node.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              {node.createdAt && (
                <div>
                  <span className="text-text-muted block text-2xs uppercase font-semibold tracking-wider">{t('common.createdAt', 'Ngày tạo')}</span>
                  <span className="font-medium text-text-secondary">{formatDate(node.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Inventory Stats & List */}
        <div className="md:col-span-2 space-y-6">
          {/* Inventory Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-secondary flex flex-col justify-between p-5 space-y-2">
              <span className="text-2xs uppercase tracking-wider text-text-muted font-bold">
                {t('node.totalProducts')}
              </span>
              <span className="metric-number text-[26px]">
                {totalProducts}
              </span>
            </div>
            <div className="card-secondary flex flex-col justify-between p-5 space-y-2">
              <span className="text-2xs uppercase tracking-wider text-text-muted font-bold">
                {t('node.totalUnits')}
              </span>
              <span className="metric-number text-[26px]">
                {totalUnits.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="card-secondary flex flex-col justify-between p-5 space-y-2">
              <span className="text-2xs uppercase tracking-wider text-text-muted font-bold">
                {t('node.totalValue')}
              </span>
              <span className="metric-number text-[24px] text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          {/* Inventory List Card */}
          <div className="card space-y-4">
            <h2 className="card-title text-[18px] font-semibold border-b border-border pb-3">
              {t('node.inventory')}
            </h2>

            {node.inventory && node.inventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="table-header-cell">{t('product.name', 'Sản phẩm')}</th>
                      <th className="table-header-cell">SKU</th>
                      <th className="table-header-cell text-right">{t('product.quantity', 'Số lượng tồn')}</th>
                      <th className="table-header-cell text-right">{t('product.unitPrice', 'Đơn giá')}</th>
                      <th className="table-header-cell text-right">{t('batch.totalValue', 'Tổng giá trị')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {node.inventory.map((item: any) => (
                      <tr key={item.productId} className="table-row">
                        <td className="table-cell font-medium text-text-primary truncate max-w-[200px]">
                          {item.productName}
                        </td>
                        <td className="table-cell font-mono text-[12px] text-text-muted">
                          {item.sku || '—'}
                        </td>
                        <td className="table-cell text-right font-mono text-[12px] text-text-secondary">
                          <span className="font-semibold text-text-primary">{item.quantity}</span> {item.unit}
                        </td>
                        <td className="table-cell text-right font-mono text-[12px] text-text-muted">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="table-cell text-right font-mono text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <span className="text-3xl">📦</span>
                <p className="text-sm text-text-muted font-medium">
                  {t('node.inventoryEmpty')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
