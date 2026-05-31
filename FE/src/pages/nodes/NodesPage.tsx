import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useNodesList,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
} from '../../hooks/queries/useNodes';
import type { Node, CreateNodeDto, UpdateNodeDto } from '../../types/node.types';
import { NodeType } from '../../utils/constants';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function NodesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 10;

  // React Query queries/mutations
  const { data, isLoading } = useNodesList({ page, limit });
  const createMutation = useCreateNode();
  const updateMutation = useUpdateNode();
  const deleteMutation = useDeleteNode();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateNodeDto>({
    name: '',
    nodeType: NodeType.MANUFACTURER,
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setSelectedNode(null);
    setFormData({
      name: '',
      nodeType: NodeType.MANUFACTURER,
      address: '',
      latitude: 0,
      longitude: 0,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (node: Node) => {
    setSelectedNode(node);
    setFormData({
      name: node.name,
      nodeType: node.nodeType,
      address: node.address || '',
      latitude: node.latitude || 0,
      longitude: node.longitude || 0,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDelete = (node: Node) => {
    setSelectedNode(node);
    setIsDeleteOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = t('node.validation.nameRequired');
    }
    if (!formData.nodeType) {
      errors.nodeType = t('node.validation.typeRequired');
    }
    if (formData.latitude === undefined || isNaN(formData.latitude)) {
      errors.latitude = t('node.validation.latRequired');
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = t('node.validation.latRange');
    }
    if (formData.longitude === undefined || isNaN(formData.longitude)) {
      errors.longitude = t('node.validation.lngRequired');
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = t('node.validation.lngRange');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (selectedNode) {
      // Edit
      const updateData: UpdateNodeDto = {
        name: formData.name,
        nodeType: formData.nodeType,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        version: selectedNode.version, // optimistic lock
      };
      
      updateMutation.mutate(
        { id: selectedNode.id, data: updateData },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      // Add
      const createData: CreateNodeDto = {
        name: formData.name,
        nodeType: formData.nodeType,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      createMutation.mutate(createData, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedNode) {
      deleteMutation.mutate(selectedNode.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
    }
  };

  // Table columns definition
  const columns: Column<Node>[] = [
    {
      key: 'name',
      header: t('node.name'),
      className: 'w-[200px]',
      render: (node) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {node.name}
        </span>
      ),
    },
    {
      key: 'nodeType',
      header: t('node.nodeType'),
      className: 'w-[150px]',
      render: (node) => t(`node.types.${node.nodeType}`, node.nodeType),
    },
    {
      key: 'address',
      header: t('node.address'),
      render: (node) => (
        <span className="truncate block max-w-[250px]" title={node.address || ''}>
          {node.address || '-'}
        </span>
      ),
    },
    {
      key: 'coordinates',
      header: t('node.coordinates'),
      className: 'w-[180px]',
      render: (node) =>
        node.latitude !== null && node.longitude !== null
          ? `${node.latitude.toFixed(5)}, ${node.longitude.toFixed(5)}`
          : '-',
    },
    {
      key: 'isActive',
      header: t('common.status'),
      className: 'w-[120px]',
      render: (node) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
            node.isActive
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              node.isActive ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'
            }`}
          />
          {node.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[100px] text-right',
      render: (node) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(node)}
            className="btn-ghost p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150"
            title={t('common.edit')}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(node)}
            className="btn-ghost p-1 text-zinc-500 hover:text-red-650 dark:hover:text-red-400"
            title={t('common.delete')}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {t('node.title')}
          </h1>
          <p className="secondary-label mt-1">
            {t('node.subtitle')}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          <span>{t('node.createNode')}</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={data?.data}
        columns={columns}
        loading={isLoading}
        totalItems={data?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Create/Edit Node Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedNode ? t('node.updateNode') : t('node.createNode')}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('node.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input-field ${formErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder={t('node.namePlaceholder')}
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('node.nodeType')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nodeType}
                onChange={(e) =>
                  setFormData({ ...formData, nodeType: e.target.value as NodeType })
                }
                className="input-field"
                required
              >
                {Object.values(NodeType).map((type) => (
                  <option key={type} value={type}>
                    {t(`node.types.${type}`, type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {/* Optional Empty space or other fields */}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('node.address')}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              placeholder={t('node.addressPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('node.latitude')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0000001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) })
                }
                className={`input-field ${formErrors.latitude ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('node.latPlaceholder')}
                required
              />
              {formErrors.latitude && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.latitude}</p>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('node.longitude')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0000001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                }
                className={`input-field ${formErrors.longitude ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('node.lngPlaceholder')}
                required
              />
              {formErrors.longitude && (
                <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.longitude}</p>
              )}
            </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('node.confirmDeleteTitle')}
        message={t('node.confirmDeleteMessage', { name: selectedNode?.name })}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
