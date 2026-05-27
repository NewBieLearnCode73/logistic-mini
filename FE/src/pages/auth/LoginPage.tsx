import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { authApi } from '../../api/auth.api';
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginRes = await authApi.login({ email, password });
      const token = loginRes.data.accessToken;
      setToken(token);

      const meRes = await authApi.me();
      setUser(meRes.data);

      toast.success(`${t('auth.welcomeBack')}, ${meRes.data.fullName}`);
      navigate(from, { replace: true });
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Top-right controls */}
      <div className="fixed right-4 top-4 flex items-center gap-1">
        <button onClick={toggleLanguage} className="btn-ghost text-2xs">
          {i18n.language === 'vi' ? 'EN' : 'VI'}
        </button>
        <button onClick={toggleTheme} className="btn-ghost">
          {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full max-w-[340px]">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-text-primary">Mini Logistic</h1>
          <p className="mt-0.5 text-[13px] text-text-muted">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin1@logistic.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-9"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2">
            {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-2xs font-medium text-text-muted mb-1.5">Demo accounts</p>
          <div className="space-y-0.5 font-mono text-2xs text-text-muted">
            <p>admin1@logistic.com / password123</p>
            <p>admin2@logistic.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
