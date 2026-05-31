import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RoleName, BatchStatus, ShipmentStatus } from '../../utils/constants';
import { useNodesList } from '../../hooks/queries/useNodes';
import { useBatchesList } from '../../hooks/queries/useBatches';
import { useShipmentsList, useCreateShipment } from '../../hooks/queries/useShipments';
import type { Shipment, CreateShipmentDto } from '../../types/shipment.types';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function ShipmentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getRole, getNodeId } = useAuthStore();

  const role = getRole();
  const userNodeId = getNodeId();
  const isAdmin = role === RoleName.ADMIN;
  const isManufacturer = role === RoleName.MANUFACTURER;
  const isDistributor = role === RoleName.DISTRIBUTOR;
  const canCreate = isAdmin || isManufacturer || isDistributor;

  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const limit = 10;

  // React Query queries
  const { data: shipmentsData, isLoading } = useShipmentsList({
    page,
    limit,
    status: selectedStatus || undefined,
  });

  const { data: nodesData } = useNodesList({ limit: 1000 });
  const { data: batchesData } = useBatchesList({ limit: 1000 });

  const createMutation = useCreateShipment();

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<CreateShipmentDto>({
    batchId: '',
    sourceNodeId: '',
    destinationNodeId: '',
    quantityShipped: 0,
    notes: '',
    expectedDeliveryDate: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      batchId: '',
      sourceNodeId: isAdmin ? '' : userNodeId || '',
      destinationNodeId: '',
      quantityShipped: 1,
      notes: '',
      expectedDeliveryDate: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.batchId) {
      errors.batchId = t('shipment.batchRequired');
    }
    if (isAdmin && !formData.sourceNodeId) {
      errors.sourceNodeId = t('node.validation.typeRequired'); // source node is required
    }
    if (!formData.destinationNodeId) {
      errors.destinationNodeId = t('shipment.destinationRequired');
    }
    if (formData.quantityShipped <= 0) {
      errors.quantityShipped = t('shipment.quantityShippedMin');
    }
    
    // Check destination is not source
    const effectiveSource = isAdmin ? formData.sourceNodeId : userNodeId;
    if (effectiveSource && formData.destinationNodeId === effectiveSource) {
      errors.destinationNodeId = t('errors.validationError'); // cannot be same node
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const createData: CreateShipmentDto = {
      batchId: formData.batchId,
      sourceNodeId: isAdmin ? formData.sourceNodeId : undefined,
      destinationNodeId: formData.destinationNodeId,
      quantityShipped: Number(formData.quantityShipped),
      notes: formData.notes || undefined,
      expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : undefined,
    };

    createMutation.mutate(createData, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const columns: Column<Shipment>[] = [
    {
      key: 'trackingCode',
      header: t('shipment.trackingCode'),
      className: 'w-[180px] font-mono text-2xs uppercase text-text-primary',
    },
    {
      key: 'batchCode',
      header: t('batch.batchCode'),
      className: 'w-[180px] font-mono text-2xs uppercase text-text-secondary',
      render: (s) => s.batch?.batchCode || '—',
    },
    {
      key: 'product',
      header: t('batch.product'),
      render: (s) => s.batch?.product?.name || '—',
    },
    {
      key: 'sourceNode',
      header: t('shipment.sourceNode'),
      render: (s) => s.sourceNode?.name || '—',
    },
    {
      key: 'destinationNode',
      header: t('shipment.destNode'),
      render: (s) => s.destinationNode?.name || '—',
    },
    {
      key: 'quantityShipped',
      header: t('shipment.quantityShipped'),
      className: 'w-[100px]',
      render: (s) => (
        <span>
          {s.quantityShipped} {s.batch?.unit}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      className: 'w-[120px]',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'shippedAt',
      header: t('shipment.shippedAt'),
      className: 'w-[110px]',
      render: (s) => formatDate(s.shippedAt),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[80px] text-right',
      render: (s) => (
        <button
          onClick={() => navigate(`/shipments/${s.id}`)}
          className="btn-ghost p-1 text-text-secondary hover:text-text-primary"
          title={t('common.detail')}
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const batches = (Array.isArray(batchesData) ? batchesData : batchesData?.data) || [];
  const nodes = (Array.isArray(nodesData) ? nodesData : nodesData?.data) || [];

  // Filter batches shippable by current user
  const effectiveSourceNodeId = isAdmin ? formData.sourceNodeId : userNodeId;
  const shippableBatches = batches.filter((b) => {
    // Cannot ship sold, lost, or discarded batches
    if (b.status === BatchStatus.SOLD || b.status === BatchStatus.LOST || b.status === BatchStatus.DISCARDED) {
      return false;
    }
    // Non-admin can only ship batches currently at their node
    if (!isAdmin) {
      return b.currentNodeId === userNodeId;
    }
    // Admin can ship from selected source node
    return !effectiveSourceNodeId || b.currentNodeId === effectiveSourceNodeId;
  });

  // Filter active destination nodes (exclude source node)
  const activeDestinationNodes = nodes.filter(
    (n) => n.isActive && n.id !== effectiveSourceNodeId
  );

  return (
    <div className="space-y-4">
      {/* Page Title & Action Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="page-title">
            {t('shipment.title')}
          </h1>
          <p className="secondary-label text-[14px]">
            {t('sidebar.dashboard')} &middot; <span className="font-semibold text-text-primary">{t('shipment.title')}</span>
          </p>
        </div>
        {canCreate && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            <span>{t('shipment.createShipment')}</span>
          </button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        data={shipmentsData?.data}
        columns={columns}
        loading={isLoading}
        totalItems={shipmentsData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        filters={
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 px-2 text-[12px] h-8 w-auto min-w-[130px]"
            >
              <option value="">{t('common.allStatus')}</option>
              {Object.values(ShipmentStatus).map((status) => (
                <option key={status} value={status}>
                  {t(`shipment.status.${status}`, status)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Create Shipment Form Modal */}
      {canCreate && (
        <FormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={t('shipment.createShipment')}
          size="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Source Node (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  {t('shipment.sourceNode')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sourceNodeId}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceNodeId: e.target.value, batchId: '' })
                  }
                  className={`input-field ${formErrors.sourceNodeId ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">{t('user.selectNode')}</option>
                  {nodes.filter((n) => n.isActive).map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                {formErrors.sourceNodeId && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">
                    {formErrors.sourceNodeId}
                  </p>
                )}
              </div>
            )}

            {/* Select Batch */}
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('batch.title')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.batchId}
                onChange={(e) => {
                  const b = shippableBatches.find((item) => item.id === e.target.value);
                  setFormData({
                    ...formData,
                    batchId: e.target.value,
                    quantityShipped: b ? b.quantity : 1,
                  });
                }}
                className={`input-field ${formErrors.batchId ? 'border-red-500' : ''}`}
                required
                disabled={isAdmin && !formData.sourceNodeId}
              >
                <option value="">{t('shipment.selectBatch')}</option>
                {shippableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchCode} ({b.product?.name} &middot; {b.quantity} {b.unit})
                  </option>
                ))}
              </select>
              {formErrors.batchId && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.batchId}</p>
              )}
            </div>

            {/* Destination Node */}
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('shipment.destNode')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.destinationNodeId}
                onChange={(e) => setFormData({ ...formData, destinationNodeId: e.target.value })}
                className={`input-field ${formErrors.destinationNodeId ? 'border-red-500' : ''}`}
                required
              >
                <option value="">{t('shipment.selectDestination')}</option>
                {activeDestinationNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({t(`node.types.${node.nodeType}`, node.nodeType)})
                  </option>
                ))}
              </select>
              {formErrors.destinationNodeId && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">
                  {formErrors.destinationNodeId}
                </p>
              )}
            </div>

            {/* Quantity Shipped */}
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('shipment.quantityShipped')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.001"
                step="any"
                value={formData.quantityShipped || ''}
                onChange={(e) =>
                  setFormData({ ...formData, quantityShipped: parseFloat(e.target.value) })
                }
                className={`input-field ${formErrors.quantityShipped ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.quantityShipped && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">
                  {formErrors.quantityShipped}
                </p>
              )}
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('shipment.expectedDeliveryDate')}
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                {t('shipment.notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field h-20 resize-none py-1.5"
                placeholder="..."
              />
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
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
      )}
    </div>
  );
}
