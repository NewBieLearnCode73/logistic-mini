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
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('xlsx');
  const [exportPeriod, setExportPeriod] = useState<'today' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const canExport = role === 'Admin' || role === 'Manufacturer';

  const handleExport = async () => {
    if (exportPeriod === 'custom') {
      if (!startDate || !endDate) {
        toast.error(t('reports.selectDate'));
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error(t('reports.invalidDateRange'));
        return;
      }
    }

    setIsExporting(true);
    try {
      const response = await dashboardApi.exportReport({
        reportType,
        format: exportFormat,
        period: exportPeriod,
        startDate: exportPeriod === 'custom' ? startDate : undefined,
        endDate: exportPeriod === 'custom' ? endDate : undefined,
      });

      // Handle JSON error response wrapped in blob
      const contentType = response.headers['content-type'] as string;
      if (contentType && contentType.includes('application/json')) {
        const text = await (response.data as Blob).text();
        const errObj = JSON.parse(text);
        toast.error(errObj.message || t('reports.exportError'));
        setIsExporting(false);
        return;
      }
      
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="page-title">
          {t('dashboard.title')}
        </h1>
        <p className="secondary-label text-[14px]">
          {t('auth.welcomeBack')}, <span className="font-semibold text-text-primary">{user?.fullName}</span>
          {role && (
            <span className="ml-2 text-text-muted">· {t(`user.roles.${role}`, role)}</span>
          )}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="card space-y-5">
          <div className="border-b border-border pb-3">
            <h2 className="card-title text-[18px] font-semibold">
              {t('reports.title')}
            </h2>
            <p className="secondary-label mt-1">
              {t('reports.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-secondary">{t('reports.reportType')}</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="input-field"
              >
                <option value="inventory">{t('reports.inventory')}</option>
                <option value="shipments">{t('reports.shipments')}</option>
                {role !== 'Manufacturer' && (
                  <option value="incidents">{t('reports.incidents')}</option>
                )}
              </select>
            </div>
            <div className="w-40 space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-secondary">{t('reports.period')}</label>
              <select
                value={exportPeriod}
                onChange={(e) => setExportPeriod(e.target.value as any)}
                className="input-field"
              >
                <option value="today">{t('reports.periods.today')}</option>
                <option value="month">{t('reports.periods.month')}</option>
                <option value="quarter">{t('reports.periods.quarter')}</option>
                <option value="year">{t('reports.periods.year')}</option>
                <option value="custom">{t('reports.periods.custom')}</option>
              </select>
            </div>
            {exportPeriod === 'custom' && (
              <>
                <div className="w-40 space-y-1.5">
                  <label className="block text-[13px] font-semibold text-text-secondary">{t('reports.startDate')}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="w-40 space-y-1.5">
                  <label className="block text-[13px] font-semibold text-text-secondary">{t('reports.endDate')}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </>
            )}
            <div className="w-40 space-y-1.5">
              <label className="block text-[13px] font-semibold text-text-secondary">{t('reports.format')}</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="input-field"
              >
                <option value="xlsx">Excel (XLSX)</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary px-6 h-[42px] disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-semibold"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{isExporting ? t('common.loading') : t('reports.export')}</span>
            </button>
          </div>
        </div>
      )}
 
      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Shipments */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <h2 className="card-title font-semibold">
              {t('shipment.title')}
            </h2>
            <Link to="/shipments" className="btn-ghost px-3 py-1 text-2xs gap-1">
              {t('common.all')}
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
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
                          className="font-mono text-[12px] font-semibold text-text-primary hover:underline hover:text-accent-hover transition-colors"
                        >
                          {s.trackingCode}
                        </Link>
                      </td>
                      <td className="table-cell truncate max-w-[140px] font-medium text-text-secondary">
                        {s.destinationNode?.name || '—'}
                      </td>
                      <td className="table-cell font-mono text-[12px] text-text-secondary">
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
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <h2 className="card-title font-semibold">
              {t('batch.title')}
            </h2>
            <Link to="/batches" className="btn-ghost px-3 py-1 text-2xs gap-1">
              {t('common.all')}
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
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
                          className="font-mono text-[12px] font-semibold text-text-primary hover:underline hover:text-accent-hover transition-colors"
                        >
                          {b.batchCode}
                        </Link>
                      </td>
                      <td className="table-cell truncate max-w-[140px] font-medium text-text-secondary">
                        {b.product?.name || '—'}
                      </td>
                      <td className="table-cell font-mono text-[12px] text-text-secondary">
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
    <div className="card flex flex-col justify-between min-h-[120px]">
      <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className={`mt-3 metric-number ${warn
            ? 'text-red-600 dark:text-red-400'
            : 'text-text-primary'
          }`}
      >
        {loading ? (
          <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
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
              <span className="inline-block h-4 w-20 animate-pulse rounded-full bg-muted" />
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
      <td colSpan={cols} className="px-5 py-10 text-center text-[13px] text-text-muted">
        {t('common.noData')}
      </td>
    </tr>
  );
}

