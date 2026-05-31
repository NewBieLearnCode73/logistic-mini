import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditLogsList } from '../../hooks/queries/useAudit';
import type { AuditLog } from '../../types/audit.types';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import { EyeIcon } from '@heroicons/react/24/outline';

// Helper component to render a premium visual comparison between oldValues and newValues
function JSONDiffViewer({ oldValues, newValues }: { oldValues: any; newValues: any }) {
  const { t } = useTranslation();

  const cleanOld = oldValues && typeof oldValues === 'object' ? oldValues : {};
  const cleanNew = newValues && typeof newValues === 'object' ? newValues : {};

  // Combine all keys (excluding passwords or passwordHashes for security)
  const allKeys = Array.from(
    new Set([...Object.keys(cleanOld), ...Object.keys(cleanNew)])
  ).filter((k) => k !== 'password' && k !== 'passwordHash' && k !== 'token');

  if (allKeys.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-[13px]">
        {t('audit.noChanges')}
      </div>
    );
  }

  return (
    <div className="border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg overflow-hidden text-2xs">
      <div className="overflow-x-auto max-h-[350px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/10 border-b border-zinc-200/50 dark:border-zinc-800/40">
              <th className="p-2.5 font-semibold text-zinc-400 dark:text-zinc-550 w-1/4">Field</th>
              <th className="p-2.5 font-semibold text-zinc-400 dark:text-zinc-550 w-3/8">{t('audit.oldValues')}</th>
              <th className="p-2.5 font-semibold text-zinc-400 dark:text-zinc-550 w-3/8">{t('audit.newValues')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 font-mono">
            {allKeys.map((key) => {
              const hasOld = key in cleanOld;
              const hasNew = key in cleanNew;
              const oldVal = cleanOld[key];
              const newVal = cleanNew[key];

              let rowClass = '';
              let oldValDisplay = '—';
              let newValDisplay = '—';
              let oldValClass = 'text-zinc-500';
              let newValClass = 'text-zinc-500';

              const formatValue = (v: any): string => {
                if (v === null) return 'null';
                if (v === undefined) return 'undefined';
                if (typeof v === 'object') return JSON.stringify(v, null, 2);
                return String(v);
              };

              if (hasOld && !hasNew) {
                // Removed key
                rowClass = 'bg-red-50/40 dark:bg-red-950/10';
                oldValDisplay = formatValue(oldVal);
                oldValClass = 'text-red-650 dark:text-red-400 line-through';
              } else if (!hasOld && hasNew) {
                // Added key
                rowClass = 'bg-emerald-50/40 dark:bg-emerald-950/10';
                newValDisplay = formatValue(newVal);
                newValClass = 'text-emerald-650 dark:text-emerald-400 font-medium';
              } else {
                // Both keys exist
                const oldStr = formatValue(oldVal);
                const newStr = formatValue(newVal);
                oldValDisplay = oldStr;
                newValDisplay = newStr;

                if (oldStr !== newStr) {
                  // Value modified
                  rowClass = 'bg-blue-50/40 dark:bg-blue-950/10';
                  oldValClass = 'text-zinc-500 dark:text-zinc-500 line-through';
                  newValClass = 'text-blue-600 dark:text-blue-400 font-medium';
                } else {
                  // Value unchanged (fade it out for density)
                  rowClass = 'opacity-65';
                  oldValClass = 'text-zinc-400 dark:text-zinc-500';
                  newValClass = 'text-zinc-400 dark:text-zinc-500';
                }
              }

              return (
                <tr key={key} className={`${rowClass} transition-colors hover:bg-zinc-50/10 dark:hover:bg-zinc-900/10`}>
                  <td className="p-2.5 font-medium text-zinc-700 dark:text-zinc-300 font-sans">{key}</td>
                  <td className={`p-2.5 whitespace-pre-wrap break-all ${oldValClass}`}>{oldValDisplay}</td>
                  <td className={`p-2.5 whitespace-pre-wrap break-all ${newValClass}`}>{newValDisplay}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'raw'>('diff');

  // React Query Hook
  const { data: auditData, isLoading } = useAuditLogsList({ page, limit });

  const handleOpenDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setActiveTab('diff');
    setDetailModalOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'occurredAt',
      header: t('audit.timestamp'),
      className: 'w-[180px] text-gray-900 dark:text-gray-100 font-medium',
      render: (log) => formatDate(log.occurredAt),
    },
    {
      key: 'actor',
      header: t('audit.actor'),
      className: 'w-[180px]',
      render: (log) => {
        if (log.actor) {
          return (
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-gray-900 dark:text-gray-150">
                {log.actor.fullName}
              </span>
              <span className="text-3xs text-gray-400 font-mono leading-none mt-0.5">
                {log.actor.email}
              </span>
            </div>
          );
        }
        return <span className="text-gray-400 italic">System</span>;
      },
    },
    {
      key: 'action',
      header: t('audit.action'),
      className: 'w-[120px]',
      render: (log) => {
        const actionColors: Record<string, string> = {
          CREATE: 'text-emerald-700 bg-emerald-50/40 dark:text-emerald-450 dark:bg-emerald-950/10 border border-emerald-200/20',
          UPDATE: 'text-zinc-700 bg-zinc-50/40 dark:text-zinc-300 dark:bg-zinc-900/10 border border-zinc-200/50',
          DELETE: 'text-red-700 bg-red-50/40 dark:text-red-400 dark:bg-red-950/10 border border-red-200/20',
          LOGIN: 'text-indigo-700 bg-indigo-50/40 dark:text-indigo-400 dark:bg-indigo-950/10 border border-indigo-200/20',
        };
        const baseColor = actionColors[log.action] || 'text-zinc-700 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-900 border border-zinc-200/50';
        return (
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold ${baseColor}`}>
            {log.action}
          </span>
        );
      },
    },
    {
      key: 'entityType',
      header: t('audit.entityType'),
      className: 'w-[160px] font-medium text-gray-800 dark:text-gray-250',
      render: (log) => {
        return (
          <div className="flex flex-col">
            <span>{log.entityType}</span>
            {log.entityId && (
              <span className="text-3xs text-gray-400 font-mono leading-none mt-0.5 uppercase truncate max-w-[120px]">
                ID: {log.entityId}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'ipAddress',
      header: t('audit.ipAddress'),
      className: 'w-[120px] font-mono text-[11px] text-gray-500 dark:text-gray-400',
      render: (log) => log.ipAddress || '—',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[130px] text-right',
      render: (log) => (
        <button
          onClick={() => handleOpenDetail(log)}
          className="btn-ghost p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
          <EyeIcon className="h-3.5 w-3.5 inline mr-1" />
          <span className="text-2xs font-semibold">{t('audit.viewValues')}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {t('audit.title')}
          </h1>
          <p className="secondary-label mt-1">
            {t('audit.subtitle')}
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <DataTable
        data={auditData?.data}
        columns={columns}
        loading={isLoading}
        totalItems={auditData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      {/* JSON Payload Detail Modal */}
      <FormModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`${selectedLog?.action} - ${selectedLog?.entityType}`}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Context metadata block */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-800/20 p-3 rounded-lg border border-gray-100 dark:border-gray-850/60 text-[13px] text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-2xs text-gray-400 block mb-0.5">{t('audit.actor')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedLog.actor?.fullName || 'System'}
                </span>
                {selectedLog.actor?.email && (
                  <span className="text-3xs text-gray-400 block font-mono">({selectedLog.actor.email})</span>
                )}
              </div>
              <div>
                <span className="text-2xs text-gray-400 block mb-0.5">{t('audit.timestamp')}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedLog.occurredAt)}
                </span>
              </div>
              <div>
                <span className="text-2xs text-gray-400 block mb-0.5">{t('audit.ipAddress')}</span>
                <span className="font-mono text-gray-850 dark:text-gray-200">
                  {selectedLog.ipAddress || '—'}
                </span>
              </div>
              <div>
                <span className="text-2xs text-gray-400 block mb-0.5">{t('audit.userAgent')}</span>
                <span className="truncate block font-mono text-2xs text-gray-500 max-w-[320px]" title={selectedLog.userAgent || ''}>
                  {selectedLog.userAgent || '—'}
                </span>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('diff')}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'diff'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-850 dark:hover:text-gray-250'
                }`}
              >
                Visual Comparison
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'raw'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-850 dark:hover:text-gray-250'
                }`}
              >
                Raw JSON Payload
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-2">
              {activeTab === 'diff' ? (
                <JSONDiffViewer
                  oldValues={selectedLog.oldValues}
                  newValues={selectedLog.newValues}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-2xs font-semibold text-gray-400 dark:text-gray-550 uppercase mb-1.5">
                      {t('audit.oldValues')}
                    </h4>
                    <pre className="text-3xs font-mono bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 overflow-auto max-h-[300px] text-gray-700 dark:text-gray-300">
                      {selectedLog.oldValues
                        ? JSON.stringify(selectedLog.oldValues, null, 2)
                        : 'null'}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-2xs font-semibold text-gray-400 dark:text-gray-550 uppercase mb-1.5">
                      {t('audit.newValues')}
                    </h4>
                    <pre className="text-3xs font-mono bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 overflow-auto max-h-[300px] text-gray-700 dark:text-gray-300">
                      {selectedLog.newValues
                        ? JSON.stringify(selectedLog.newValues, null, 2)
                        : 'null'}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="btn-secondary py-1.5 px-4 text-xs font-semibold"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
