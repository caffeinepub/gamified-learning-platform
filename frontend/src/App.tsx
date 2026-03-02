import React, { useEffect } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { loadUserId, clearUserId } from '@/lib/userStore';
import { useQueryClient } from '@tanstack/react-query';

import Layout from '@/components/Layout';
import OnboardingPage from '@/pages/OnboardingPage';
import WorldMapPage from '@/pages/WorldMapPage';
import LessonPage from '@/pages/LessonPage';
import SkillTreePage from '@/pages/SkillTreePage';
import DailyQuestsPage from '@/pages/DailyQuestsPage';
import StreakTrackerPage from '@/pages/StreakTrackerPage';
import MultiplayerPage from '@/pages/MultiplayerPage';
import AITutorPage from '@/pages/AITutorPage';
import ProfilePage from '@/pages/ProfilePage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ShopPage from '@/pages/ShopPage';
import LoginPage from '@/pages/LoginPage';

// Root route with Layout
const rootRoute = createRootRoute({
  component: Layout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const worldMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/world-map',
  component: WorldMapPage,
});

const lessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lesson/$worldId',
  component: LessonPage,
});

const skillTreeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skill-tree',
  component: SkillTreePage,
});

const dailyQuestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-quests',
  component: DailyQuestsPage,
});

const streakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/streak',
  component: StreakTrackerPage,
});

const multiplayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/multiplayer',
  component: MultiplayerPage,
});

const aiTutorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-tutor',
  component: AITutorPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: ShopPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/world-map' });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  onboardingRoute,
  worldMapRoute,
  lessonRoute,
  skillTreeRoute,
  dailyQuestsRoute,
  streakRoute,
  multiplayerRoute,
  aiTutorRoute,
  profileRoute,
  leaderboardRoute,
  shopRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Auth guard wrapper
function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  // Clear user data on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearUserId();
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'oklch(0.13 0.025 265)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 rounded-full animate-spin"
            style={{ borderColor: 'oklch(0.78 0.16 85)', borderTopColor: 'transparent' }} />
          <p className="font-heading text-xl" style={{ color: 'oklch(0.88 0.14 85)' }}>
            Loading EduQuest...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated but profile loading
  if (profileLoading && !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'oklch(0.13 0.025 265)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 rounded-full animate-spin"
            style={{ borderColor: 'oklch(0.78 0.16 85)', borderTopColor: 'transparent' }} />
          <p className="font-heading text-xl" style={{ color: 'oklch(0.88 0.14 85)' }}>
            Preparing your adventure...
          </p>
        </div>
      </div>
    );
  }

  // Authenticated but no profile → onboarding
  const showOnboarding = isAuthenticated && isFetched && userProfile === null;
  if (showOnboarding) {
    return <OnboardingPage />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppContent />;
}
