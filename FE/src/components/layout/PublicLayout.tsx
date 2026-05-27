import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import AppLayout from './AppLayout';

export default function PublicLayout() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  };

  if (isAuthenticated) {
    return <AppLayout />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="text-[13px] font-semibold text-text-primary">
            Mini Logistic
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggleLanguage} className="btn-ghost text-2xs">
              {i18n.language === 'vi' ? 'EN' : 'VI'}
            </button>
            <button onClick={toggleTheme} className="btn-ghost">
              {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="btn-primary ml-1">{t('auth.login')}</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

