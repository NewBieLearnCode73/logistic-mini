import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useIncidentsList, useCreateIncident, useConfirmLostIncident, useConfirmFoundIncident } from '../../hooks/queries/useIncidents';
import { useShipmentsList } from '../../hooks/queries/useShipments';
import type { IncidentReport, CreateIncidentDto } from '../../types/incident.types';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function IncidentsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [page, setPage] = useState(1);
  const limit = 10;

  // React Query queries
  const { data: incidentsData, isLoading } = useIncidentsList({ page, limit });
  const { data: shipmentsData } = useShipmentsList({ page: 1, limit: 1000 });

  const createMutation = useCreateIncident();
  const confirmLostMutation = useConfirmLostIncident();
  const confirmFoundMutation = useConfirmFoundIncident();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLostConfirmOpen, setIsLostConfirmOpen] = useState(false);
  const [isFoundConfirmOpen, setIsFoundConfirmOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateIncidentDto>({
    shipmentId: '',
    incidentType: 'MISSING',
    description: '',
    priority: 'MEDIUM',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      shipmentId: '',
      incidentType: 'MISSING',
      description: '',
      priority: 'MEDIUM',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.shipmentId) {
      errors.shipmentId = t('incident.shipmentRequired');
    }
    if (!formData.incidentType) {
      errors.incidentType = t('incident.incidentTypeRequired');
    }
    if (!formData.description.trim()) {
      errors.description = t('incident.descMinLength');
    } else if (formData.description.trim().length < 20) {
      errors.description = t('incident.descMinLength');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleOpenLostConfirm = (incident: IncidentReport) => {
    setSelectedIncident(incident);
    setIsLostConfirmOpen(true);
  };

  const handleOpenFoundConfirm = (incident: IncidentReport) => {
    setSelectedIncident(incident);
    setIsFoundConfirmOpen(true);
  };

  const handleConfirmLost = () => {
    if (selectedIncident) {
      confirmLostMutation.mutate(selectedIncident.id, {
        onSuccess: () => {
          setIsLostConfirmOpen(false);
        },
      });
    }
  };

  const handleConfirmFound = () => {
    if (selectedIncident) {
      confirmFoundMutation.mutate(selectedIncident.id, {
        onSuccess: () => {
          setIsFoundConfirmOpen(false);
        },
      });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const columns: Column<IncidentReport>[] = [
    {
      key: 'incidentCode',
      header: t('incident.incidentCode'),
      className: 'w-[150px] font-mono text-2xs uppercase text-zinc-900 dark:text-zinc-50',
    },
    {
      key: 'shipment',
      header: t('shipment.trackingCode'),
      className: 'w-[160px] font-mono text-2xs uppercase',
      render: (inc) => inc.shipment?.trackingCode || '—',
    },
    {
      key: 'incidentType',
      header: t('incident.incidentType'),
      className: 'w-[140px]',
      render: (inc) => t(`incident.types.${inc.incidentType}`, inc.incidentType),
    },
    {
      key: 'priority',
      header: t('incident.priority'),
      className: 'w-[100px]',
      render: (inc) => {
        const priorityClasses: Record<string, string> = {
          LOW: 'badge-muted',
          MEDIUM: 'badge-info',
          HIGH: 'badge-warning',
          CRITICAL: 'badge-danger animate-pulse',
        };
        return (
          <span className={`inline-flex px-[10px] py-[3px] rounded-[8px] text-[12px] font-medium transition-colors ${priorityClasses[inc.priority] || 'badge-muted'}`}>
            {t(`incident.priorities.${inc.priority}`, inc.priority)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: t('common.status'),
      className: 'w-[175px]',
      render: (inc) => {
        const statusClasses: Record<string, string> = {
          OPEN: 'badge-warning',
          IN_PROGRESS: 'badge-primary',
          RESOLVED: 'badge-success',
          CLOSED: 'badge-muted',
        };

        const isPendingSecondApproval = inc.status === 'OPEN' && !!inc.firstApprovedBy;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`inline-flex px-[10px] py-[3px] rounded-[8px] text-[12px] font-medium transition-colors ${statusClasses[inc.status] || 'badge-muted'}`}>
              {t(`incident.statuses.${inc.status}`, inc.status)}
            </span>
            {isPendingSecondApproval && (
              <span className="inline-flex items-center gap-1 px-[8px] py-[2px] rounded-[6px] text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse">
                <span>⏳</span>
                <span>{t('incident.pendingSecondApproval', 'Chờ phê duyệt kép (1/2)')}</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'description',
      header: t('incident.description'),
      render: (inc) => (
        <span className="truncate block max-w-[200px]" title={inc.description}>
          {inc.description}
        </span>
      ),
    },
    {
      key: 'reportedBy',
      header: t('incident.reporter'),
      className: 'w-[150px]',
      render: (inc) => inc.reporter?.fullName || '—',
    },
    {
      key: 'openedAt',
      header: t('audit.timestamp'),
      className: 'w-[110px]',
      render: (inc) => formatDate(inc.openedAt),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[180px] text-right',
      render: (inc) => {
        if (inc.status !== 'OPEN') return <span className="text-2xs text-zinc-400 dark:text-zinc-500">—</span>;

        // Two-Man Rule: chỉ disable nếu chính Admin1 (người đã phê duyệt bước 1) muốn bấm bước 2
        // Đặc tả chỉ yêu cầu Admin2 ≠ Admin1, không cấm người báo cáo phê duyệt lần 2
        const isLostDisabled = !!(
          inc.firstApprovedBy &&
          currentUserId === inc.firstApprovedBy
        );

        return (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => handleOpenFoundConfirm(inc)}
              className={`btn-ghost p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20`}
              title={t('incident.confirmFound')}
            >
              <CheckIcon className="h-4 w-4 inline" />
              <span className="text-2xs font-semibold ml-0.5">{t('incident.confirmFound')}</span>
            </button>
            <button
              onClick={() => handleOpenLostConfirm(inc)}
              disabled={isLostDisabled}
              className={`btn-ghost p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isLostDisabled ? t('incident.dualApprovalWarn') : t('incident.confirmLost')}
            >
              <XMarkIcon className="h-4 w-4 inline" />
              <span className="text-2xs font-semibold ml-0.5">{t('incident.confirmLost')}</span>
            </button>
          </div>
        );
      },
    },
  ];

  const eligibleShipments = (shipmentsData?.data || []).filter(
    (s) => s.status === 'IN_TRANSIT' || s.status === 'DELAYED'
  );

  return (
    <div className="space-y-4">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {t('incident.title')}
          </h1>
          <p className="secondary-label mt-1">
            {t('incident.subtitle')}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          <span>{t('incident.createIncident')}</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={incidentsData?.data}
        columns={columns}
        loading={isLoading}
        totalItems={incidentsData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Create Incident Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={t('incident.createIncident')}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Select Shipment */}
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t('shipment.title')} <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={eligibleShipments.map((s) => ({
                value: s.id,
                label: `${s.trackingCode}${s.status === 'DELAYED' ? 'DELAYED' : ''}`,
                subLabel: `${s.batch?.batchCode || ''} · ${s.batch?.product?.name || ''}`,
              }))}
              value={formData.shipmentId}
              onChange={(val) => setFormData({ ...formData, shipmentId: val })}
              placeholder={t('incident.selectShipment')}
              searchPlaceholder={t('common.search')}
              error={!!formErrors.shipmentId}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Incident Type */}
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t('incident.incidentType')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                className="input-field"
                required
              >
                {['MISSING', 'DAMAGED', 'FRAUD', 'OTHER'].map((type) => (
                  <option key={type} value={type}>
                    {t(`incident.types.${type}`, type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t('incident.priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field"
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((prio) => (
                  <option key={prio} value={prio}>
                    {t(`incident.priorities.${prio}`, prio)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t('incident.description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`input-field h-24 resize-none py-1.5 ${formErrors.description ? 'border-red-500' : ''}`}
              placeholder="..."
              required
            />
            {formErrors.description ? (
              <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.description}</p>
            ) : (
              <p className="mt-1 text-3xs text-zinc-400 dark:text-zinc-500">{t('incident.descMinLength')}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="btn-secondary py-1.5"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary py-1.5"
            >
              {createMutation.isPending ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Confirm Lost Action Dialog */}
      <ConfirmDialog
        isOpen={isLostConfirmOpen}
        onClose={() => setIsLostConfirmOpen(false)}
        onConfirm={handleConfirmLost}
        title={t('incident.confirmLostTitle')}
        message={t('incident.confirmLostDesc')}
        confirmText={t('incident.confirmLost')}
        loading={confirmLostMutation.isPending}
      />

      {/* Confirm Found Action Dialog */}
      <ConfirmDialog
        isOpen={isFoundConfirmOpen}
        onClose={() => setIsFoundConfirmOpen(false)}
        onConfirm={handleConfirmFound}
        title={t('incident.confirmFoundTitle')}
        message={t('incident.confirmFoundDesc')}
        confirmText={t('incident.confirmFound')}
        loading={confirmFoundMutation.isPending}
      />
    </div>
  );
}
