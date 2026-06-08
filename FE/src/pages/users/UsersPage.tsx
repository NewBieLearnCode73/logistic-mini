import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNodesList } from '../../hooks/queries/useNodes';
import SearchableSelect from '../../components/ui/SearchableSelect';
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useToggleActiveUser,
  useResetPasswordUser,
} from '../../hooks/queries/useUsers';
import type { User, CreateUserDto, UpdateUserDto } from '../../types/auth.types';
import { RoleName } from '../../utils/constants';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PlusIcon, PencilIcon, KeyIcon, NoSymbolIcon, CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { t } = useTranslation();
  
  // Page states
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const limit = 10;

  // React Query queries
  const { data: nodesData } = useNodesList({ limit: 1000 });
  const { data: usersData, isLoading } = useUsersList({
    page,
    limit,
    role: selectedRole || undefined,
    nodeId: selectedNodeId || undefined,
    isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toggleActiveMutation = useToggleActiveUser();
  const resetPasswordMutation = useResetPasswordUser();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isToggleActiveOpen, setIsToggleActiveOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordModalTitle, setPasswordModalTitle] = useState('');

  // Form input states
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    fullName: '',
    role: RoleName.MANUFACTURER,
    nodeId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      fullName: '',
      role: RoleName.MANUFACTURER,
      nodeId: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    const userRole = user.userRoles?.[0]?.role?.name || RoleName.MANUFACTURER;
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: userRole as RoleName,
      nodeId: user.nodeId || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenToggleActive = (user: User) => {
    setSelectedUser(user);
    setIsToggleActiveOpen(true);
  };

  const handleOpenResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedUser && !formData.email.trim()) {
      errors.email = t('user.validation.emailRequired');
    } else if (!selectedUser && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('user.validation.emailInvalid');
    }
    if (!formData.fullName.trim()) {
      errors.fullName = t('user.validation.nameRequired');
    }
    if (!formData.role) {
      errors.role = t('user.validation.roleRequired');
    }
    if (formData.role !== RoleName.ADMIN && !formData.nodeId) {
      errors.nodeId = t('user.validation.nodeRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Node is null for Admin role
    const nodeIdValue = formData.role === RoleName.ADMIN ? null : formData.nodeId || null;

    if (selectedUser) {
      // Edit user
      const updateData: UpdateUserDto = {
        fullName: formData.fullName,
        role: formData.role,
        nodeId: nodeIdValue,
      };
      updateMutation.mutate(
        { id: selectedUser.id, data: updateData },
        {
          onSuccess: () => {
            setIsFormOpen(false);
          },
        }
      );
    } else {
      // Create user
      const createData: CreateUserDto = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        nodeId: nodeIdValue || undefined,
      };
      createMutation.mutate(createData, {
        onSuccess: (res) => {
          setIsFormOpen(false);
          if (res.temporaryPassword) {
            setGeneratedPassword(res.temporaryPassword);
            setPasswordModalTitle(t('user.tempPasswordTitle'));
            setIsPasswordModalOpen(true);
          }
        },
      });
    }
  };

  const handleToggleActiveConfirm = () => {
    if (selectedUser) {
      toggleActiveMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setIsToggleActiveOpen(false);
        },
      });
    }
  };

  const handleResetPasswordConfirm = () => {
    if (selectedUser) {
      resetPasswordMutation.mutate(selectedUser.id, {
        onSuccess: (res) => {
          setIsResetPasswordOpen(false);
          if (res.temporaryPassword) {
            setGeneratedPassword(res.temporaryPassword);
            setPasswordModalTitle(t('user.resetButton'));
            setIsPasswordModalOpen(true);
          }
        },
      });
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success(t('user.copied'));
  };

  // Find node name by ID for table display
  const getNodeName = (nodeId: string | null) => {
    if (!nodeId || !nodesData) return '-';
    // nodesData could be array or PaginatedResponse
    const list = Array.isArray(nodesData) ? nodesData : nodesData.data;
    const node = list?.find((n) => n.id === nodeId);
    return node ? node.name : '-';
  };

  // Columns definition
  const columns: Column<User>[] = [
    {
      key: 'fullName',
      header: t('user.fullName'),
      className: 'w-[180px]',
      render: (u) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {u.fullName}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      className: 'w-[200px] font-mono text-2xs text-zinc-400 dark:text-zinc-500',
    },
    {
      key: 'role',
      header: t('user.role'),
      className: 'w-[150px]',
      render: (u) => {
        const roleName = u.userRoles?.[0]?.role?.name || '-';
        return t(`user.roles.${roleName}`, roleName);
      },
    },
    {
      key: 'nodeId',
      header: t('user.node'),
      render: (u) => getNodeName(u.nodeId),
    },
    {
      key: 'isActive',
      header: t('common.status'),
      className: 'w-[120px]',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
            u.isActive
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              u.isActive ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'
            }`}
          />
          {u.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'w-[120px] text-right',
      render: (u) => {
        const isSelf = false; // We can check with current logged-in user id later if needed
        return (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => handleOpenEdit(u)}
              className="btn-ghost p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150"
              title={t('common.edit')}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleOpenToggleActive(u)}
              disabled={isSelf}
              className={`btn-ghost p-1 disabled:opacity-30 ${
                u.isActive ? 'text-zinc-500 hover:text-red-650 dark:hover:text-red-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
              title={u.isActive ? t('user.toggleActive') : t('user.toggleActive')}
            >
              {u.isActive ? (
                <NoSymbolIcon className="h-4 w-4" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
            </button>
            {/* Don't reset password for Admin roles via simple Admin UI if prohibited */}
            <button
              onClick={() => handleOpenResetPassword(u)}
              disabled={u.userRoles?.some((ur) => ur.role?.name === 'Admin')}
              className="btn-ghost p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150 disabled:opacity-30 disabled:cursor-not-allowed"
              title={t('user.resetPassword')}
            >
              <KeyIcon className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const activeNodes = (Array.isArray(nodesData) ? nodesData : nodesData?.data)?.filter(
    (n) => n.isActive
  );

  const rolesList = Object.values(RoleName);

  return (
    <div className="space-y-4">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {t('user.title')}
          </h1>
          <p className="secondary-label mt-1">
            {t('user.subtitle')}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          <span>{t('user.createUser')}</span>
        </button>
      </div>

      {/* Main DataTable with Filters */}
      <DataTable
        data={usersData?.data}
        columns={columns}
        loading={isLoading}
        totalItems={usersData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        filters={
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Role filter */}
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 px-2 text-[12px] h-8 w-auto min-w-[120px]"
            >
              <option value="">{t('common.allRoles')}</option>
              {rolesList.map((role) => (
                <option key={role} value={role}>
                  {t(`user.roles.${role}`, role)}
                </option>
              ))}
            </select>

            {/* Node filter */}
            <select
              value={selectedNodeId}
              onChange={(e) => {
                setSelectedNodeId(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 px-2 text-[12px] h-8 w-auto min-w-[150px]"
            >
              <option value="">{t('common.allNodes')}</option>
              {activeNodes?.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 px-2 text-[12px] h-8 w-auto min-w-[120px]"
            >
              <option value="">{t('common.allStatus')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </div>
        }
      />

      {/* Create/Edit User Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedUser ? t('user.updateUser') : t('user.createUser')}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!selectedUser}
              className={`input-field disabled:bg-zinc-100/50 disabled:text-zinc-500 dark:disabled:bg-zinc-900/60 ${
                formErrors.email ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder={t('user.emailPlaceholder')}
              required
            />
            {formErrors.email && (
              <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('user.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`input-field ${formErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder={t('user.namePlaceholder')}
              required
            />
            {formErrors.fullName && (
              <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('user.role')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as RoleName })
                }
                className="input-field"
                required
              >
                {rolesList.map((role) => (
                  <option key={role} value={role}>
                    {t(`user.roles.${role}`, role)}
                  </option>
                ))}
              </select>
            </div>

            {formData.role !== RoleName.ADMIN && (
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('user.node')} <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={activeNodes?.map((node) => ({
                    value: node.id,
                    label: node.name,
                    subLabel: t(`node.types.${node.nodeType}`, node.nodeType),
                  })) || []}
                  value={formData.nodeId || ''}
                  onChange={(val) => setFormData({ ...formData, nodeId: val })}
                  placeholder={t('user.selectNode')}
                  searchPlaceholder={t('common.search')}
                  error={!!formErrors.nodeId}
                  required
                />
                {formErrors.nodeId && (
                  <p className="mt-1 text-2xs text-red-600 dark:text-red-400">{formErrors.nodeId}</p>
                )}
              </div>
            )}
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

      {/* Lock/Unlock Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isToggleActiveOpen}
        onClose={() => setIsToggleActiveOpen(false)}
        onConfirm={handleToggleActiveConfirm}
        title={selectedUser?.isActive ? t('user.confirmLockTitle') : t('user.confirmUnlockTitle')}
        message={
          selectedUser?.isActive
            ? t('user.confirmLockMessage', { name: selectedUser?.fullName })
            : t('user.confirmUnlockMessage', { name: selectedUser?.fullName })
        }
        confirmText={selectedUser?.isActive ? t('common.delete') : t('common.confirm')}
        loading={toggleActiveMutation.isPending}
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onConfirm={handleResetPasswordConfirm}
        title={t('user.confirmResetTitle')}
        message={t('user.confirmResetMessage', { name: selectedUser?.fullName })}
        confirmText={t('user.resetButton')}
        loading={resetPasswordMutation.isPending}
      />

      {/* Temporary Password Display Modal */}
      <FormModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={passwordModalTitle}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            {t('user.tempPasswordDesc')}
          </p>

          <div className="flex items-center justify-between rounded-md bg-zinc-50 border border-zinc-200/50 px-3 py-2 font-mono text-[14px] font-semibold text-zinc-800 dark:bg-zinc-900/40 dark:border-zinc-800/40 dark:text-zinc-200">
            <span className="select-all tracking-wider">{generatedPassword}</span>
            <button
              onClick={handleCopyToClipboard}
              className="btn-ghost p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title={t('user.copyPassword')}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setIsPasswordModalOpen(false)} className="btn-primary py-1.5 px-4">
              {t('common.close')}
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
