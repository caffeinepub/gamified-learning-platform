import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { loadUserId, saveUserId } from "./lib/userStore";
import AITutorPage from "./pages/AITutorPage";
import DailyQuestsPage from "./pages/DailyQuestsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LessonPage from "./pages/LessonPage";
import LoginPage from "./pages/LoginPage";
import MultiplayerPage from "./pages/MultiplayerPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import ProgressPage from "./pages/ProgressPage";
import RewardsPage from "./pages/RewardsPage";
import ShopPage from "./pages/ShopPage";
import SkillTreePage from "./pages/SkillTreePage";
import StreakTrackerPage from "./pages/StreakTrackerPage";
import WorldMapPage from "./pages/WorldMapPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export type AppPage =
  | "login"
  | "onboarding"
  | "worldmap"
  | "lesson"
  | "skilltree"
  | "dailyquests"
  | "streak"
  | "multiplayer"
  | "tutor"
  | "profile"
  | "leaderboard"
  | "shop"
  | "rewards"
  | "progress";

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [currentPage, setCurrentPage] = useState<AppPage>("login");
  const [lessonWorldId, setLessonWorldId] = useState<string>("world1");
  const [userId, setUserId] = useState<string>(() => loadUserId() || "");

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      setCurrentPage("login");
    } else if (showProfileSetup) {
      setCurrentPage("onboarding");
    } else if (
      isAuthenticated &&
      profileFetched &&
      userProfile !== null &&
      currentPage === "login"
    ) {
      setCurrentPage("worldmap");
    }
  }, [
    isAuthenticated,
    isInitializing,
    showProfileSetup,
    profileFetched,
    userProfile,
    currentPage,
  ]);

  const navigate = (page: AppPage, params?: { worldId?: string }) => {
    if (params?.worldId) setLessonWorldId(params.worldId);
    setCurrentPage(page);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <p className="font-heading text-xl text-gold">Loading EduQuest...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {}} />;
  }

  if (showProfileSetup || currentPage === "onboarding") {
    return (
      <OnboardingPage
        onComplete={(newUserId: string) => {
          setUserId(newUserId);
          saveUserId(newUserId);
          navigate("worldmap");
        }}
      />
    );
  }

  if (profileLoading && !profileFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="font-heading text-xl text-gold">
            Preparing your adventure...
          </p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "worldmap":
        return (
          <WorldMapPage
            userId={userId}
            onEnterWorld={(worldId) => navigate("lesson", { worldId })}
          />
        );
      case "lesson":
        return (
          <LessonPage
            worldId={lessonWorldId}
            userId={userId}
            onBack={() => navigate("worldmap")}
            onComplete={() => navigate("worldmap")}
          />
        );
      case "skilltree":
        return <SkillTreePage userId={userId} />;
      case "dailyquests":
        return <DailyQuestsPage userId={userId} />;
      case "streak":
        return <StreakTrackerPage userId={userId} />;
      case "multiplayer":
        return <MultiplayerPage userId={userId} />;
      case "tutor":
        return <AITutorPage userId={userId} />;
      case "profile":
        return (
          <ProfilePage
            userId={userId}
            onLogout={() => {
              queryClient.clear();
              setUserId("");
              navigate("login");
            }}
          />
        );
      case "leaderboard":
        return <LeaderboardPage userId={userId} />;
      case "shop":
        return <ShopPage userId={userId} />;
      case "rewards":
        return <RewardsPage userId={userId} />;
      case "progress":
        return <ProgressPage userId={userId} />;
      default:
        return (
          <WorldMapPage
            userId={userId}
            onEnterWorld={(worldId) => navigate("lesson", { worldId })}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
