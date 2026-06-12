import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { PageLoader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import {
  LoginPageWrapper,
  RegisterPage,
  DashboardPage,
  ParticipantsPage,
  EventsPage,
  EventDetailPage,
  InstructorsPage,
  CertificatesPage,
  BulkGeneratePage,
  TemplatesPage,
} from '@/pages';
import { InvitationPage } from '@/pages/invitation/InvitationPage';

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
  return (
    <ThemeProvider>
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
                <Route path="/participants"    element={<ParticipantsPage />} />
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
    </ThemeProvider>
  );
};

export default App;