import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CampaignListPage } from './pages/CampaignListPage';
import { CampaignNewPage } from './pages/CampaignNewPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { CampaignEditPage } from './pages/CampaignEditPage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/campaigns', element: <CampaignListPage /> },
          { path: '/campaigns/new', element: <CampaignNewPage /> },
          { path: '/campaigns/:id', element: <CampaignDetailPage /> },
          { path: '/campaigns/:id/edit', element: <CampaignEditPage /> },
          { path: '/', element: <Navigate to="/campaigns" replace /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
