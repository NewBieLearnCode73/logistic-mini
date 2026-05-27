import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStats, useRecentShipments, useRecentBatches } from '../../hooks/queries/useDashboard';
import { dashboardApi } from '../../api/dashboard.api';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, getRole } = useAuthStore();
  const role = getRole();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: shipments, isLoading: shipmentsLoading } = useRecentShipments();
  const { data: batches, isLoading: batchesLoading } = useRecentBatches();

  // Reports Export states
  const [reportType, setReportType] = useState<'inventory' | 'shipments' | 'incidents'>('inventory');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const canExport = role === 'Admin' || role === 'Manufacturer';

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await dashboardApi.exportReport({ reportType, format: exportFormat });
      
      // Handle file download natively from blob response
      const blob = new Blob([response.data], { type: response.headers['content-type'] as string });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `report_${reportType}.${exportFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(?:"([^"]+)"|([^;]+))/);
        if (filenameMatch) {
          filename = filenameMatch[1] || filenameMatch[2];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('reports.exportSuccess'));
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error(t('reports.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          {t('dashboard.title')}
        </h1>
        <p className="text-[13px] text-text-secondary">
          {t('auth.welcomeBack')}, {user?.fullName}
          {role && (
            <span className="ml-1.5 text-text-muted">· {t(`user.roles.${role}`, role)}</span>
          )}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={t('dashboard.totalInventory')}
          value={stats?.totalInventory}
          loading={statsLoading}
        />
        <StatCard
          label={t('dashboard.activeShipments')}
          value={stats?.activeShipments}
          loading={statsLoading}
        />
        <StatCard
          label={t('dashboard.openIncidents')}
          value={stats?.incidents}
          loading={statsLoading}
          warn={stats?.incidents ? stats.incidents > 0 : false}
        />
      </div>
 
      {/* Reports Export Card (Authorized Roles Only) */}
      {canExport && (
        <div className="card space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-[13px] font-semibold text-text-primary">
              {t('reports.title')}
            </h2>
            <p className="text-[12px] text-text-muted mt-0.5">
              {t('reports.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3 text-2xs">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-text-secondary mb-1 font-medium text-[12px]">{t('reports.reportType')}</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="input-field py-1.5"
              >
                <option value="inventory">{t('reports.inventory')}</option>
                <option value="shipments">{t('reports.shipments')}</option>
                <option value="incidents">{t('reports.incidents')}</option>
              </select>
            </div>
            <div className="w-32">
              <label className="block text-text-secondary mb-1 font-medium text-[12px]">{t('reports.format')}</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="input-field py-1.5"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF (Helvetica)</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 h-[34px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{isExporting ? t('common.loading') : t('reports.export')}</span>
            </button>
          </div>
        </div>
      )}
 
      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Shipments */}
        <div className="card p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-[13px] font-semibold text-text-primary">
              {t('shipment.title')}
            </h2>
            <Link to="/shipments" className="btn-ghost text-2xs gap-1">
              {t('common.all')}
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header-cell">{t('shipment.trackingCode')}</th>
                  <th className="table-header-cell">{t('shipment.destNode')}</th>
                  <th className="table-header-cell">{t('shipment.quantityShipped')}</th>
                  <th className="table-header-cell">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {shipmentsLoading ? (
                  <TableSkeleton cols={4} rows={3} />
                ) : shipments?.data?.length ? (
                  shipments.data.map((s) => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell">
                        <Link
                          to={`/shipments/${s.id}`}
                          className="font-mono text-[12px] text-text-primary hover:underline"
                        >
                          {s.trackingCode}
                        </Link>
                      </td>
                      <td className="table-cell truncate max-w-[140px]">
                        {s.destinationNode?.name || '—'}
                      </td>
                      <td className="table-cell font-mono text-[12px]">
                        {s.quantityShipped}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow cols={4} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Batches */}
        <div className="card p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-[13px] font-semibold text-text-primary">
              {t('batch.title')}
            </h2>
            <Link to="/batches" className="btn-ghost text-2xs gap-1">
              {t('common.all')}
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header-cell">{t('batch.batchCode')}</th>
                  <th className="table-header-cell">{t('batch.product')}</th>
                  <th className="table-header-cell">{t('batch.quantity')}</th>
                  <th className="table-header-cell">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {batchesLoading ? (
                  <TableSkeleton cols={4} rows={3} />
                ) : batches?.data?.length ? (
                  batches.data.map((b) => (
                    <tr key={b.id} className="table-row">
                      <td className="table-cell">
                        <Link
                          to={`/batches/${b.id}`}
                          className="font-mono text-[12px] text-text-primary hover:underline"
                        >
                          {b.batchCode}
                        </Link>
                      </td>
                      <td className="table-cell truncate max-w-[140px]">
                        {b.product?.name || '—'}
                      </td>
                      <td className="table-cell font-mono text-[12px]">
                        {b.quantity} <span className="text-text-muted">{b.unit}</span>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow cols={4} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function StatCard({
  label,
  value,
  loading,
  warn,
}: {
  label: string;
  value?: number;
  loading: boolean;
  warn?: boolean;
}) {
  return (
    <div className="card">
      <p className="text-2xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-semibold tabular-nums ${warn
            ? 'text-red-650 dark:text-red-400'
            : 'text-text-primary'
          }`}
      >
        {loading ? (
          <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />
        ) : (
          (value ?? 0).toLocaleString()
        )}
      </p>
    </div>
  );
}

function TableSkeleton({ cols, rows }: { cols: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="table-cell">
              <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-8 text-center text-[13px] text-text-muted">
        {t('common.noData')}
      </td>
    </tr>
  );
}
