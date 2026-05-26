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
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-gray-200 bg-white px-5 dark:border-gray-800 dark:bg-gray-950">
      <button
        onClick={onMenuClick}
        className="btn-ghost p-1 lg:hidden -ml-2 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
        title="Menu"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-1">
        <button onClick={toggleLanguage} className="btn-ghost text-[12px] font-semibold">
          {i18n.language === 'vi' ? 'EN' : 'VI'}
        </button>
        <button onClick={toggleTheme} className="btn-ghost p-1.5">
          {isDark ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
