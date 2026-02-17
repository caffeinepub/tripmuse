import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppShell from './components/AppShell';
import AuthGate from './features/auth/AuthGate';
import ProfileSetupDialog from './features/auth/ProfileSetupDialog';
import TripsDashboardPage from './features/dashboard/TripsDashboardPage';
import TripPlannerWizard from './features/trip-planner/TripPlannerWizard';
import TripPlanPage from './features/trips/TripPlanPage';
import TripPlanPrintPage from './features/export/TripPlanPrintPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TripsDashboardPage,
});

const newTripRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-trip',
  component: TripPlannerWizard,
});

const tripRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trip/$tripId',
  component: TripPlanPage,
});

const printRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trip/$tripId/print',
  component: TripPlanPrintPage,
});

const routeTree = rootRoute.addChildren([indexRoute, newTripRoute, tripRoute, printRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
      {showProfileSetup && <ProfileSetupDialog />}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}
