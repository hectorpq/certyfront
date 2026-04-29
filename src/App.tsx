import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import { Layout } from '@/components/layout';
import { PageLoader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  LoginPageWrapper,
  RegisterPage,
  DashboardPage,
  StudentsPage,
  EventsPage,
  EventDetailPage,
  InstructorsPage,
  CertificatesPage,
  BulkGeneratePage,
  TemplatesPage,
} from '@/pages';
import { InvitationPage } from '@/pages/invitation/InvitationPage';

// ─── Theme Context ────────────────────────────────────────────────────────────
// Permite que cualquier componente (ej: topbar del Dashboard) acceda al toggle
interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

// ─── Query Client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export const App = () => {
  const { isDark, toggle } = useTheme(); // ← aplica clase "dark" al <html>

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <Routes>
            <Route path="/login"               element={<LoginPageWrapper />} />
            <Route path="/register"            element={<RegisterPage />} />
            <Route path="/invitation/:token"   element={<InvitationPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard"       element={<DashboardPage />} />
                <Route path="/students"        element={<StudentsPage />} />
                <Route path="/events"          element={<EventsPage />} />
                <Route path="/events/:id"      element={<EventDetailPage />} />
                <Route path="/instructors"     element={<InstructorsPage />} />
                <Route path="/certificates"    element={<CertificatesPage />} />
                <Route path="/templates"       element={<TemplatesPage />} />
                <Route path="/bulk-generate"   element={<BulkGeneratePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
};

export default App;