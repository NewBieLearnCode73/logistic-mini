import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useIncidentsList, useCreateIncident, useConfirmLostIncident, useConfirmFoundIncident } from '../../hooks/queries/useIncidents';
import { useShipmentsList } from '../../hooks/queries/useShipments';
import type { IncidentReport, CreateIncidentDto } from '../../types/incident.types';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
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
        const priorityColors: Record<string, string> = {
          LOW: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-900/60',
          MEDIUM: 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/10',
          HIGH: 'text-orange-650 bg-orange-50/40 dark:text-orange-400 dark:bg-orange-950/10',
          CRITICAL: 'text-red-650 bg-red-50/40 dark:text-red-400 dark:bg-red-950/10 font-bold animate-pulse',
        };
        return (
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold ${priorityColors[inc.priority] || ''}`}>
            {t(`incident.priorities.${inc.priority}`, inc.priority)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: t('common.status'),
      className: 'w-[110px]',
      render: (inc) => {
        const statusColors: Record<string, string> = {
          OPEN: 'text-amber-700 dark:text-amber-400',
          IN_PROGRESS: 'text-blue-700 dark:text-blue-400',
          RESOLVED: 'text-emerald-700 dark:text-emerald-400',
          CLOSED: 'text-zinc-500 dark:text-zinc-400',
        };
        return (
          <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${statusColors[inc.status] || ''}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${inc.status === 'OPEN' ? 'bg-amber-500' : inc.status === 'CLOSED' ? 'bg-zinc-400 dark:bg-zinc-500' : 'bg-blue-500'}`} />
            {t(`incident.statuses.${inc.status}`, inc.status)}
          </span>
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

        const isReporter = inc.reportedBy === currentUserId;

        return (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => handleOpenFoundConfirm(inc)}
              disabled={isReporter}
              className={`btn-ghost p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isReporter ? t('incident.dualApprovalWarn') : t('incident.confirmFound')}
            >
              <CheckIcon className="h-4 w-4 inline" />
              <span className="text-2xs font-semibold ml-0.5">{t('incident.confirmFound')}</span>
            </button>
            <button
              onClick={() => handleOpenLostConfirm(inc)}
              disabled={isReporter}
              className={`btn-ghost p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isReporter ? t('incident.dualApprovalWarn') : t('incident.confirmLost')}
            >
              <XMarkIcon className="h-4 w-4 inline" />
              <span className="text-2xs font-semibold ml-0.5">{t('incident.confirmLost')}</span>
            </button>
          </div>
        );
      },
    },
  ];

  const inTransitShipments = (shipmentsData?.data || []).filter((s) => s.status === 'IN_TRANSIT');

  return (
    <div className="space-y-4">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('incident.title')}
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
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
            <select
              value={formData.shipmentId}
              onChange={(e) => setFormData({ ...formData, shipmentId: e.target.value })}
              className={`input-field ${formErrors.shipmentId ? 'border-red-500' : ''}`}
              required
            >
              <option value="">{t('incident.selectShipment')}</option>
              {inTransitShipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.trackingCode} ({s.batch?.batchCode} &middot; {s.batch?.product?.name})
                </option>
              ))}
            </select>
            {formErrors.shipmentId && (
              <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.shipmentId}</p>
            )}
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
