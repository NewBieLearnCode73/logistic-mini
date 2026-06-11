import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Layouts
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FinancialReportPage from './pages/dashboard/FinancialReportPage';
import NodesPage from './pages/nodes/NodesPage';
import NodeDetailPage from './pages/nodes/NodeDetailPage';
import ProductsPage from './pages/products/ProductsPage';
import UsersPage from './pages/users/UsersPage';
import BatchesPage from './pages/batches/BatchesPage';
import BatchDetailPage from './pages/batches/BatchDetailPage';
import ShipmentsPage from './pages/shipments/ShipmentsPage';
import ShipmentDetailPage from './pages/shipments/ShipmentDetailPage';
import IncidentsPage from './pages/incidents/IncidentsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import ScanPage from './pages/public/ScanPage';
import TracePage from './pages/public/TracePage';
import MapPage from './pages/map/MapPage';
import NotFoundPage from './pages/NotFoundPage';

// Stores
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { authApi } from './api/auth.api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeStore();
  const { token, setUser, logout } = useAuthStore();

  // Apply theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Validate token and fetch user on mount
  useEffect(() => {
    if (token) {
      authApi
        .me()
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInitializer>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/trace/:batchCode" element={<TracePage />} />
            </Route>

            {/* Login - standalone */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Supply chain - all authenticated */}
                <Route path="/batches" element={<BatchesPage />} />
                <Route path="/batches/:id" element={<BatchDetailPage />} />
                <Route path="/shipments" element={<ShipmentsPage />} />
                <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/nodes/:id" element={<NodeDetailPage />} />

                {/* Admin and Retailer financial reports */}
                <Route element={<RoleGuard allowed={['Admin', 'Retailer']} />}>
                  <Route path="/reports/financial" element={<FinancialReportPage />} />
                </Route>

                {/* Admin only */}
                <Route element={<RoleGuard allowed={['Admin']} />}>
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/nodes" element={<NodesPage />} />
                  <Route path="/incidents" element={<IncidentsPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/map" element={<MapPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              },
            }}
          />
        </AppInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


