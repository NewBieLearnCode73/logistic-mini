import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { RoleName } from '../../utils/constants';
import {
  useProductsList,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/queries/useProducts';
import type { Product, CreateProductDto, UpdateProductDto } from '../../types/product.types';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { getRole } = useAuthStore();
  const isAdmin = getRole() === RoleName.ADMIN;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const limit = 10;

  // React Query queries/mutations
  const { data: productsData, isLoading } = useProductsList({
    page,
    limit,
    search: search || undefined,
    category: category || undefined,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    sku: '',
    unit: '',
    description: '',
    category: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      sku: '',
      unit: '',
      description: '',
      category: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      description: product.description || '',
      category: product.category || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = t('product.validation.nameRequired');
    }
    if (!formData.sku.trim()) {
      errors.sku = t('product.validation.skuRequired');
    }
    if (!formData.unit.trim()) {
      errors.unit = t('product.validation.unitRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (selectedProduct) {
      // Edit
      const updateData: UpdateProductDto = {
        name: formData.name,
        sku: formData.sku,
        unit: formData.unit,
        description: formData.description,
        category: formData.category,
      };

      updateMutation.mutate(
        { id: selectedProduct.id, data: updateData },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      // Add
      createMutation.mutate(formData, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
    }
  };

  // Table columns definition
  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: t('product.name'),
      className: 'font-medium text-zinc-900 dark:text-zinc-50',
    },
    {
      key: 'sku',
      header: t('product.sku'),
      className: 'w-[150px] font-mono text-2xs uppercase text-zinc-400 dark:text-zinc-500',
    },
    {
      key: 'unit',
      header: t('product.unitLabel'),
      className: 'w-[120px]',
    },
    {
      key: 'category',
      header: t('product.category'),
      className: 'w-[150px]',
      render: (p) => p.category ? t(`product.categories.${p.category}`, p.category) : '-',
    },
    {
      key: 'description',
      header: t('product.description'),
      render: (p) => (
        <span className="truncate block max-w-[200px]" title={p.description || ''}>
          {p.description || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('common.status'),
      className: 'w-[120px]',
      render: (p) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
            p.isActive
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              p.isActive ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'
            }`}
          />
          {p.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
  ];

  // If Admin, append Actions column
  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[100px] text-right',
      render: (p) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(p)}
            className="btn-ghost p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150"
            title={t('common.edit')}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(p)}
            className="btn-ghost p-1 text-zinc-500 hover:text-red-650 dark:hover:text-red-400"
            title={t('common.delete')}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    });
  }

  // Pre-defined categories for simplicity, or can be general string input
  const categoriesList = ['Food', 'Fashion', 'Electronics', 'Medical', 'Cosmetics', 'Other'];

  return (
    <div className="space-y-4">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('product.title')}
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
            {t('product.subtitle')}
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            <span>{t('product.createProduct')}</span>
          </button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        data={productsData?.data}
        columns={columns}
        loading={isLoading}
        totalItems={productsData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('product.searchPlaceholder')}
        filters={
          <div className="flex items-center gap-1.5">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field py-1 px-2 text-[12px] h-8 w-auto min-w-[120px]"
            >
              <option value="">{t('common.all')} {t('product.category').toLowerCase()}</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`product.categories.${cat}`, cat)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Create/Edit Product Form Modal */}
      {isAdmin && (
        <FormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={selectedProduct ? t('product.updateProduct') : t('product.createProduct')}
          size="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('product.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-field ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('product.namePlaceholder')}
                required
              />
              {formErrors.name && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('product.sku')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className={`input-field font-mono text-2xs uppercase ${
                    formErrors.sku ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="SKU-MILK-1L"
                  required
                />
                {formErrors.sku && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.sku}</p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('product.unitLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className={`input-field ${formErrors.unit ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('product.unitPlaceholder')}
                  required
                />
                {formErrors.unit && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.unit}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('product.category')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="">{t('product.selectCategory')}</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`product.categories.${cat}`, cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('product.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-20 resize-none py-1.5"
                placeholder={t('product.descPlaceholder')}
              />
            </div>

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
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary py-1.5"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t('common.loading')
                  : t('common.save')}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={t('product.confirmDeleteTitle')}
          message={t('product.confirmDeleteMessage', { name: selectedProduct?.name })}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
