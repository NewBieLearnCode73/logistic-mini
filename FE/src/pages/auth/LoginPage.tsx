import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { authApi } from '../../api/auth.api';
import {
  SunIcon,
  MoonIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
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

  const handleAutofill = (selectedEmail: string, roleName: string) => {
    setEmail(selectedEmail);
    setPassword('password123');
    toast.success(
      i18n.language === 'vi'
        ? `Đã chọn tài khoản: ${roleName}`
        : `Selected account: ${roleName}`
    );
  };

  const demoAccounts = [
    {
      roleEn: 'Admin',
      roleVi: 'Quản trị viên',
      email: 'admin@logistic.com',
      icon: ShieldCheckIcon,
      colorClass: 'border-blue-500/20 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      roleEn: 'Manufacturer',
      roleVi: 'Nhà sản xuất',
      email: 'mfr_a@logistic.com',
      icon: BuildingOffice2Icon,
      colorClass: 'border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      roleEn: 'Distributor',
      roleVi: 'Nhà phân phối',
      email: 'dist_a@logistic.com',
      icon: TruckIcon,
      colorClass: 'border-purple-500/20 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      roleEn: 'Retailer',
      roleVi: 'Đại lý bán lẻ',
      email: 'ret_a@logistic.com',
      icon: ShoppingBagIcon,
      colorClass: 'border-amber-500/20 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-12 min-h-screen bg-background overflow-x-hidden">
      {/* 🚀 LEFT COLUMN: SUPPLY CHAIN TELEMETRY (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#070e17] flex-col justify-between p-8 relative overflow-hidden border-r border-[#1a2d42]">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#1b4363] blur-[120px] opacity-20 animate-glow-pulse-1" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#0a5275] blur-[140px] opacity-20 animate-glow-pulse-2" />

        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)]" />

        {/* Top Branding Section */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#62CBEA] to-[#0F3347] flex items-center justify-center shadow-lg shadow-[#62CBEA]/20">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm tracking-wider">MINI LOGISTIC</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium tracking-wide">
            <span className="relative flex h-1.5 w-1.5 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            NETWORK LIVE
          </div>
        </div>

        {/* Center Section: Animated Supply Chain Telemetry SVG */}
        <div className="relative z-10 my-auto flex flex-col items-center">
          <div className="w-full max-w-[440px] aspect-[4/3] bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md shadow-2xl relative">
            <div className="absolute top-3 left-4 text-[10px] font-mono text-text-muted tracking-wider uppercase">
              Supply Chain Flow Telemetry
            </div>

            {/* Simulated Live Connection Lines and Nodes */}
            <svg viewBox="0 0 440 220" className="w-full h-full mt-2">
              <defs>
                <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#62CBEA" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F5C518" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Curve Flow Paths */}
              <path id="path1" d="M 70 140 C 120 70, 180 70, 220 100" fill="none" stroke="#1c3040" strokeWidth="2.5" strokeDasharray="5 5" />
              <path d="M 70 140 C 120 70, 180 70, 220 100" fill="none" stroke="url(#gradient-flow)" strokeWidth="2.5" className="animate-dash" />

              <path id="path2" d="M 220 100 C 270 130, 320 130, 370 140" fill="none" stroke="#1c3040" strokeWidth="2.5" strokeDasharray="5 5" />
              <path d="M 220 100 C 270 130, 320 130, 370 140" fill="none" stroke="url(#gradient-flow)" strokeWidth="2.5" className="animate-dash" />

              {/* Pulsing Outer Node Circles */}
              <circle cx="70" cy="140" r="26" fill="none" stroke="#62CBEA" strokeWidth="1" className="animate-signal" />
              <circle cx="220" cy="100" r="26" fill="none" stroke="#9b51e0" strokeWidth="1" className="animate-signal" />
              <circle cx="370" cy="140" r="26" fill="none" stroke="#F5C518" strokeWidth="1" className="animate-signal" />

              {/* Node Backdrops */}
              <circle cx="70" cy="140" r="18" fill="#132030" stroke="#62CBEA" strokeWidth="1.5" />
              <circle cx="220" cy="100" r="18" fill="#132030" stroke="#9b51e0" strokeWidth="1.5" />
              <circle cx="370" cy="140" r="18" fill="#132030" stroke="#F5C518" strokeWidth="1.5" />

              {/* Node SVG Icons */}
              {/* Manufacturer Icon (Factory) */}
              <g transform="translate(59, 129) scale(0.9)" className="text-[#62CBEA] stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </g>

              {/* Warehouse Hub Icon (Box) */}
              <g transform="translate(209, 89) scale(0.9)" className="text-[#9b51e0] stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </g>

              {/* Retailer Icon (Shopping Bag) */}
              <g transform="translate(359, 129) scale(0.9)" className="text-[#F5C518] stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </g>

              {/* Live Sliding Glow Dots along pathways */}
              <circle r="4" fill="#62CBEA" className="filter drop-shadow-[0_0_8px_#62CBEA]">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 70 140 C 120 70, 180 70, 220 100" />
              </circle>
              <circle r="4" fill="#F5C518" className="filter drop-shadow-[0_0_8px_#F5C518]">
                <animateMotion dur="3.5s" repeatCount="indefinite" path="M 220 100 C 270 130, 320 130, 370 140" />
              </circle>

              {/* Node Labels */}
              <text x="70" y="180" textAnchor="middle" fill="#9ABAC6" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                {i18n.language === 'vi' ? 'Nhà Máy' : 'Factory'}
              </text>
              <text x="220" y="140" textAnchor="middle" fill="#9ABAC6" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                {i18n.language === 'vi' ? 'Trung Tâm' : 'Hub'}
              </text>
              <text x="370" y="180" textAnchor="middle" fill="#9ABAC6" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                {i18n.language === 'vi' ? 'Đại Lý' : 'Retailer'}
              </text>
            </svg>
          </div>

          {/* Live Mini Stats Cockpit */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[440px] mt-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide flex items-center">
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                On-Time
              </span>
              <span className="text-sm font-bold text-white mt-1">99.98%</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide flex items-center">
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
                Activity
              </span>
              <span className="text-sm font-bold text-white mt-1">4.8k ops/h</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide flex items-center">
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Exceptions
              </span>
              <span className="text-sm font-bold text-white mt-1">0 Alerts</span>
            </div>
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {i18n.language === 'vi'
              ? 'Hệ điều hành Chuỗi cung ứng Thông minh'
              : 'Autonomous Supply Chain Telemetry'}
          </h2>
          <p className="mt-1.5 text-xs text-[#9ABAC6] leading-relaxed max-w-sm">
            {i18n.language === 'vi'
              ? 'Tự động hóa hành trình, kiểm chứng chất lượng và truy nguồn gốc minh bạch từ nhà máy tới người tiêu dùng.'
              : 'Orchestrate operations, record provenance, and track real-time delivery exception pathways dynamically.'}
          </p>
        </div>
      </div>

      {/* 🔐 RIGHT COLUMN: MODERN AUTHENTICATION FORM */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 min-h-screen relative bg-bg-surface">

        {/* Floating Controls at Top Right */}
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 flex items-center gap-2.5 z-20">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-border bg-bg-surface hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-200 shadow-sm cursor-pointer"
          >
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-full border border-border bg-bg-surface hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-200 shadow-sm cursor-pointer"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <MoonIcon className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            )}
          </button>
        </div>

        {/* Form Container Wrapper */}
        <div className="max-w-[420px] w-full mx-auto my-auto space-y-6 relative z-10 pt-12 lg:pt-0">

          {/* Logo header for Mobile Devices only */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-accent to-[#1A5A78] flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-bold text-text-primary text-sm tracking-wider">MINI LOGISTIC</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {i18n.language === 'vi' ? 'Đăng nhập hệ thống' : 'Sign in to Platform'}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {i18n.language === 'vi'
                ? 'Nhập tài khoản để quản lý lô hàng, vận đơn và sự cố.'
                : 'Enter your credentials to manage batches, track fleets, and audit exceptions.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200/60 bg-red-50/60 px-4 py-3 text-[13px] text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 flex items-start gap-2.5 animate-fadeIn">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 py-2.5 rounded-xl transition-all duration-200 bg-bg-secondary focus:bg-bg-surface focus:ring-1 focus:ring-brand-accent/50 text-sm"
                  placeholder="admin@logistic.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-11 py-2.5 rounded-xl transition-all duration-200 bg-bg-secondary focus:bg-bg-surface focus:ring-1 focus:ring-brand-accent/50 text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 rounded-xl mt-2 shadow-md shadow-brand-accent-glow hover:shadow-lg hover:shadow-brand-accent-glow/20 flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.loggingIn')}
                </span>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          {/* Quick Select Demo Accounts Cockpit */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-3">
              {i18n.language === 'vi' ? 'ĐĂNG NHẬP NHANH TÀI KHOẢN DEMO' : 'QUICK DEMO LOGIN'}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleAutofill(acc.email, i18n.language === 'vi' ? acc.roleVi : acc.roleEn)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 group text-xs font-medium cursor-pointer ${acc.colorClass}`}
                  >
                    <div className="p-1 rounded-lg bg-bg-surface border border-border group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate leading-none">{i18n.language === 'vi' ? acc.roleVi : acc.roleEn}</p>
                      <p className="text-[10px] text-text-muted truncate mt-1 font-mono leading-none">{acc.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center lg:text-left mt-8 text-[11px] text-text-muted font-medium flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Mini Logistic System. All rights reserved.</span>
          <div className="flex gap-3">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
