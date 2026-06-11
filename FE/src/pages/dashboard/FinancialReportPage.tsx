import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinancialReport } from '../../hooks/queries/useDashboard';
import { dashboardApi } from '../../api/dashboard.api';
import { formatCurrency } from '../../utils/constants';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function FinancialReportPage() {
  const { t } = useTranslation();

  // Filters state
  const [period, setPeriod] = useState<'today' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Export states
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('xlsx');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch report data
  const { data, isLoading } = useFinancialReport({
    period,
    startDate: period === 'custom' ? startDate : undefined,
    endDate: period === 'custom' ? endDate : undefined,
  });

  const handleExport = async () => {
    if (period === 'custom') {
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
        reportType: 'financial',
        format: exportFormat,
        period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
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
      let filename = `financial_report_${period}.${exportFormat}`;
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="page-title">
          {t('sidebar.financialReport')}
        </h1>
        <p className="secondary-label text-[14px]">
          Theo dõi doanh thu, chi phí và lợi nhuận ròng của cửa hàng bán lẻ.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Tổng Doanh Thu"
          value={data?.kpi?.totalRevenue}
          loading={isLoading}
          isCurrency={true}
        />
        <StatCard
          label="Tổng Chi Phí"
          value={data?.kpi?.totalCost}
          loading={isLoading}
          isCurrency={true}
        />
        <StatCard
          label="Lợi Nhuận Ròng"
          value={data?.kpi?.totalProfit}
          loading={isLoading}
          isCurrency={true}
        />
        <StatCard
          label="Đã bán (Sản phẩm)"
          value={data?.kpi?.totalUnitsSold}
          loading={isLoading}
          isCurrency={false}
        />
      </div>

      {/* consolidated Filter & Export Card */}
      <div className="card space-y-5">
        <div className="border-b border-border pb-3">
          <h2 className="card-title text-[18px] font-semibold">
            Báo cáo Tài chính
          </h2>
          <p className="secondary-label mt-1">
            Xuất báo cáo tài chính sang định dạng Excel, CSV hoặc PDF theo thời gian lựa chọn.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="block text-[13px] font-semibold text-text-secondary">
              {t('reports.reportType')}
            </label>
            <select
              value="financial"
              disabled
              className="input-field bg-muted/30 cursor-not-allowed"
            >
              <option value="financial">Báo cáo Tài chính</option>
            </select>
          </div>

          <div className="w-48 space-y-1.5">
            <label className="block text-[13px] font-semibold text-text-secondary">
              {t('reports.period', 'Khoảng thời gian')}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="input-field"
            >
              <option value="today">{t('reports.periods.today')}</option>
              <option value="month">{t('reports.periods.month')}</option>
              <option value="quarter">{t('reports.periods.quarter')}</option>
              <option value="year">{t('reports.periods.year')}</option>
              <option value="custom">{t('reports.periods.custom')}</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div className="w-44 space-y-1.5">
                <label className="block text-[13px] font-semibold text-text-secondary">
                  {t('reports.startDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="w-44 space-y-1.5">
                <label className="block text-[13px] font-semibold text-text-secondary">
                  {t('reports.endDate')}
                </label>
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
            <label className="block text-[13px] font-semibold text-text-secondary">
              {t('reports.format')}
            </label>
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

      {/* Transaction Details Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <h2 className="card-title font-semibold text-text-primary">
            Chi tiết giao dịch bán lẻ
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="table-header-cell text-left">Ngày bán</th>
                <th className="table-header-cell text-left">Mã lô hàng</th>
                <th className="table-header-cell text-left">Tên sản phẩm</th>
                <th className="table-header-cell text-right">Số lượng</th>
                <th className="table-header-cell text-right">Giá vốn/đơn vị</th>
                <th className="table-header-cell text-right">Giá bán/đơn vị</th>
                <th className="table-header-cell text-right">Doanh thu</th>
                <th className="table-header-cell text-right">Chi phí</th>
                <th className="table-header-cell text-right">Lợi nhuận</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton cols={9} rows={5} />
              ) : data?.transactions?.length ? (
                data.transactions.map((tx) => (
                  <tr key={tx.id} className="table-row">
                    <td className="table-cell whitespace-nowrap text-left font-medium text-text-secondary">{formatDate(tx.saleDate)}</td>
                    <td className="table-cell text-left font-mono text-[12px] font-semibold text-text-primary">{tx.batchCode}</td>
                    <td className="table-cell text-left font-medium text-text-secondary">{tx.productName}</td>
                    <td className="table-cell text-right font-mono font-semibold text-text-secondary">{tx.quantitySold}</td>
                    <td className="table-cell text-right font-mono text-xs text-text-secondary">{formatCurrency(tx.costPrice)}</td>
                    <td className="table-cell text-right font-mono text-xs text-text-secondary">{formatCurrency(tx.salePrice)}</td>
                    <td className="table-cell text-right font-mono text-xs font-semibold text-indigo-650 dark:text-indigo-400">{formatCurrency(tx.revenue)}</td>
                    <td className="table-cell text-right font-mono text-xs text-amber-650 dark:text-amber-400">{formatCurrency(tx.cost)}</td>
                    <td className="table-cell text-right font-mono text-xs font-semibold text-emerald-650 dark:text-emerald-400">{formatCurrency(tx.profit)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow cols={9} />
              )}
            </tbody>
          </table>
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
  isCurrency,
}: {
  label: string;
  value?: number;
  loading: boolean;
  isCurrency?: boolean;
}) {
  return (
    <div className="card flex flex-col justify-between min-h-[120px]">
      <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-3 metric-number text-text-primary">
        {loading ? (
          <span className="inline-block h-8 w-24 animate-pulse rounded bg-muted" />
        ) : isCurrency ? (
          formatCurrency(value ?? 0)
        ) : (
          (value ?? 0).toLocaleString('vi-VN')
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
            <td key={j} className="table-cell text-center">
              <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />
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
