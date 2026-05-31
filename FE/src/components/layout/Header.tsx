import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../stores/themeStore';
import { SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { i18n } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-6 shadow-saas-sm">
      <button
        onClick={onMenuClick}
        className="btn-ghost p-2 lg:hidden -ml-2 rounded-full w-9 h-9 flex items-center justify-center"
        title="Menu"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleLanguage} 
          className="btn-ghost text-[12px] font-semibold px-3 py-1 rounded-full border border-border/80 hover:bg-muted"
        >
          {i18n.language === 'vi' ? 'EN' : 'VI'}
        </button>
        <button 
          onClick={toggleTheme} 
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-surface text-text-primary hover:bg-muted transition-all duration-200 shadow-sm"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? (
            <SunIcon className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
          ) : (
            <MoonIcon className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
          )}
        </button>
      </div>
    </header>
  );
}

