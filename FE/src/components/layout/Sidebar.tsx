import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import {
  HomeIcon,
  CubeIcon,
  TruckIcon,
  TagIcon,
  UsersIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { RoleName } from '../../utils/constants';
import FormModal from '../ui/FormModal';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

interface NavItem {
  type?: 'link' | 'divider';
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  path?: string;
  roles: string[] | '*';
  dynamicPath?: (nodeId: string | null) => string;
}

const navItems: NavItem[] = [
  { icon: HomeIcon, label: 'sidebar.dashboard', path: '/dashboard', roles: '*' },
  { type: 'divider', label: 'sidebar.supplyChain', roles: '*' },
  { icon: CubeIcon, label: 'sidebar.batches', path: '/batches', roles: '*' },
  { icon: TruckIcon, label: 'sidebar.shipments', path: '/shipments', roles: '*' },
  { icon: TagIcon, label: 'sidebar.products', path: '/products', roles: '*' },
  {
    icon: MapPinIcon,
    label: 'sidebar.myWarehouse',
    roles: [RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER],
    dynamicPath: (nodeId) => `/nodes/${nodeId}`,
  },
  { icon: QrCodeIcon, label: 'sidebar.scan', path: '/scan', roles: '*' },
  { type: 'divider', label: 'sidebar.administration', roles: [RoleName.ADMIN] },
  { icon: UsersIcon, label: 'sidebar.users', path: '/users', roles: [RoleName.ADMIN] },
  { icon: MapPinIcon, label: 'sidebar.nodes', path: '/nodes', roles: [RoleName.ADMIN] },
  { icon: ExclamationTriangleIcon, label: 'sidebar.incidents', path: '/incidents', roles: [RoleName.ADMIN] },
  { icon: ClipboardDocumentListIcon, label: 'sidebar.auditLogs', path: '/audit-logs', roles: [RoleName.ADMIN] },
  { icon: MapIcon, label: 'sidebar.map', path: '/map', roles: [RoleName.ADMIN] },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, getRole, logout } = useAuthStore();
  const role = getRole();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(t('auth.passwordChangedSuccess'));
      setIsChangePasswordOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = navItems.filter((item) => {
    if (item.roles === '*') return true;
    if (Array.isArray(item.roles) && role) {
      if (item.dynamicPath && !user?.nodeId) return false;
      return item.roles.includes(role);
    }
    return false;
  });

  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-border bg-surface transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-border">
        <span className="text-[14px] font-bold tracking-widest uppercase text-text-primary">
          Mini Logistic
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={index} className="pt-5 pb-1 first:pt-0">
                <p className="px-4 text-3xs font-bold uppercase tracking-widest text-text-muted">
                  {t(item.label)}
                </p>
              </div>
            );
          }

          const Icon = item.icon!;
          const toPath = item.dynamicPath ? item.dynamicPath(user?.nodeId ?? null) : item.path!;
          return (
            <NavLink
              key={toPath}
              to={toPath}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(item.label)}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User & logout */}
      <div className="border-t border-border p-3 space-y-1 bg-muted/20">
        <div className="flex items-center gap-3 px-1 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-text-inverse shadow-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-text-primary">
              {user?.fullName || 'User'}
            </p>
            <p className="truncate text-3xs uppercase font-bold tracking-wider text-text-muted">
              {role ? t(`user.roles.${role}`, role) : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsChangePasswordOpen(true);
            onClose();
          }}
          className="sidebar-link w-full text-text-muted hover:text-text-primary"
        >
          <KeyIcon className="h-4 w-4 shrink-0" />
          <span>{t('auth.changePassword')}</span>
        </button>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-text-muted hover:text-red-650 dark:hover:text-red-400"
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>

      <FormModal
        isOpen={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title={t('auth.changePassword')}
        size="sm"
      >
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('auth.oldPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('auth.newPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('auth.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="btn-secondary py-1.5"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-1.5"
            >
              {isSubmitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </FormModal>
    </aside>
  );
}
