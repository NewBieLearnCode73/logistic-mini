import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RoleName, BatchStatus, formatCurrency } from '../../utils/constants';
import { useAuthStore } from '../../stores/authStore';
import { useProductsList } from '../../hooks/queries/useProducts';
import { useNodesList } from '../../hooks/queries/useNodes';
import { useBatchesList, useCreateBatch } from '../../hooks/queries/useBatches';
import type { Batch, CreateBatchDto } from '../../types/batch.types';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function BatchesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getRole } = useAuthStore();

  const role = getRole();
  const isAdmin = role === RoleName.ADMIN;
  const isManufacturer = role === RoleName.MANUFACTURER;
  const canCreate = isAdmin || isManufacturer;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const limit = 10;

  // React Query queries
  const { data: productsData } = useProductsList({ limit: 1000 });
  const { data: nodesData } = useNodesList({ limit: 1000 });

  const { data: batchesData, isLoading } = useBatchesList({
    page,
    limit,
    search: search || undefined,
    productId: selectedProduct || undefined,
    status: selectedStatus || undefined,
  });

  const createMutation = useCreateBatch();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<CreateBatchDto>({
    productId: '',
    quantity: 0,
    unit: '',
    manufactureDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    originNodeId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      productId: '',
      quantity: 1,
      unit: '',
      manufactureDate: new Date().toISOString().slice(0, 10),
      expiryDate: '',
      originNodeId: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleProductChange = (productId: string) => {
    const list = Array.isArray(productsData) ? productsData : productsData?.data;
    const selectedProd = list?.find((p) => p.id === productId);
    setFormData({
      ...formData,
      productId,
      unit: selectedProd ? selectedProd.unit : '',
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.productId) {
      errors.productId = t('batch.validation.productRequired');
    }
    if (formData.quantity === undefined || isNaN(formData.quantity) || formData.quantity <= 0) {
      errors.quantity = t('batch.validation.quantityMin');
    }
    if (!formData.manufactureDate) {
      errors.manufactureDate = t('batch.validation.mfgRequired');
    }
    if (!formData.expiryDate) {
      errors.expiryDate = t('batch.validation.expRequired');
    } else if (
      formData.manufactureDate &&
      new Date(formData.expiryDate) <= new Date(formData.manufactureDate)
    ) {
      errors.expiryDate = t('batch.validation.expAfterMfg');
    }
    if (isAdmin && !formData.originNodeId) {
      errors.originNodeId = t('batch.validation.originRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const createData: CreateBatchDto = {
      productId: formData.productId,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      manufactureDate: new Date(formData.manufactureDate).toISOString(),
      expiryDate: new Date(formData.expiryDate).toISOString(),
      originNodeId: isAdmin ? formData.originNodeId : undefined,
    };

    createMutation.mutate(createData, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const columns: Column<Batch>[] = [
    {
      key: 'batchCode',
      header: t('batch.batchCode'),
      className: 'w-[200px] font-mono text-2xs uppercase text-zinc-900 dark:text-zinc-50',
    },
    {
      key: 'product',
      header: t('batch.product'),
      render: (b) => b.product?.name || '-',
    },
    {
      key: 'quantity',
      header: t('batch.quantity'),
      className: 'w-[100px] text-right',
      render: (b) => (
        <span>
          {b.quantity} {b.unit}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: t('product.unitPrice', 'Đơn giá'),
      className: 'w-[120px] text-right',
      render: (b) => formatCurrency(b.product?.unitPrice),
    },
    {
      key: 'totalValue',
      header: t('batch.totalValue', 'Tổng giá trị'),
      className: 'w-[140px] text-right font-medium',
      render: (b) => formatCurrency(b.totalValue),
    },
    {
      key: 'manufactureDate',
      header: t('batch.mfgDate'),
      className: 'w-[110px]',
      render: (b) => formatDate(b.manufactureDate),
    },
    {
      key: 'expiryDate',
      header: t('batch.expDate'),
      className: 'w-[110px]',
      render: (b) => formatDate(b.expiryDate),
    },
    {
      key: 'currentNode',
      header: t('batch.currentLocation'),
      render: (b) => b.currentNode?.name || '-',
    },
    {
      key: 'status',
      header: t('common.status'),
      className: 'w-[130px]',
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[80px] text-right',
      render: (b) => (
        <button
          onClick={() => navigate(`/batches/${b.id}`)}
          className="btn-ghost p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150"
          title={t('common.detail')}
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const activeProducts = Array.isArray(productsData) ? productsData : productsData?.data;

  const selectedProdDetails = activeProducts?.find((p) => p.id === formData.productId);
  const calculatedTotalValue = selectedProdDetails
    ? (selectedProdDetails.unitPrice || 0) * (formData.quantity || 0)
    : 0;

  const mfrNodes = (Array.isArray(nodesData) ? nodesData : nodesData?.data)?.filter(
    (n) => n.isActive && n.nodeType === 'MANUFACTURER'
  );

  return (
    <div className="space-y-4">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="page-title">
            {t('batch.title')}
          </h1>
          <p className="secondary-label text-[14px]">
            {t('batch.subtitle')}
          </p>
        </div>
        {canCreate && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            <span>{t('batch.createBatch')}</span>
          </button>
        )}
      </div>

      {/* Main DataTable with Filters */}
      <DataTable
        data={batchesData?.data}
        columns={columns}
        loading={isLoading}
        totalItems={batchesData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('product.searchPlaceholder')}
        filters={
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 px-2 pl-3 text-[12px] h-8 w-auto min-w-[100px]"
            >
              <option value="">{t('common.allProducts')}</option>
              {activeProducts?.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 px-2 text-[12px] h-8 w-auto min-w-[130px]"
            >
              <option value="">{t('common.allStatus')}</option>
              {Object.values(BatchStatus).map((status) => (
                <option key={status} value={status}>
                  {t(`batch.status.${status}`, status)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Create Batch Modal */}
      {canCreate && (
        <FormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={t('batch.createBatch')}
          size="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('batch.product')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className={`input-field ${formErrors.productId ? 'border-red-500' : ''}`}
                required
              >
                <option value="">{t('batch.selectProduct')}</option>
                {activeProducts?.filter((p) => p.isActive).map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.sku})
                  </option>
                ))}
              </select>
              {formErrors.productId && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.productId}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('batch.initQuantity')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={formData.quantity || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                  }
                  className={`input-field ${formErrors.quantity ? 'border-red-500' : ''}`}
                  placeholder="100"
                  required
                />
                {formErrors.quantity && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.quantity}</p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('batch.unit')}
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input-field"
                  placeholder={t('batch.unitPlaceholder')}
                />
              </div>
            </div>

            {selectedProdDetails && (
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/40">
                <div>
                  <span className="block text-2xs uppercase text-zinc-400 dark:text-zinc-500 font-semibold mb-0.5">
                    {t('product.unitPrice', 'Đơn giá')}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatCurrency(selectedProdDetails.unitPrice)}
                  </span>
                </div>
                <div>
                  <span className="block text-2xs uppercase text-zinc-400 dark:text-zinc-500 font-semibold mb-0.5">
                    {t('batch.totalValue', 'Tổng giá trị tạm tính')}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatCurrency(calculatedTotalValue)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('batch.manufactureDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                  className={`input-field ${formErrors.manufactureDate ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.manufactureDate && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">
                    {formErrors.manufactureDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('batch.expiryDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={`input-field ${formErrors.expiryDate ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.expiryDate && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.expiryDate}</p>
                )}
              </div>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('batch.origin')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.originNodeId}
                  onChange={(e) => setFormData({ ...formData, originNodeId: e.target.value })}
                  className={`input-field ${formErrors.originNodeId ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">{t('batch.selectOrigin')}</option>
                  {mfrNodes?.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                {formErrors.originNodeId && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.originNodeId}</p>
                )}
              </div>
            )}

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
      )}
    </div>
  );
}
