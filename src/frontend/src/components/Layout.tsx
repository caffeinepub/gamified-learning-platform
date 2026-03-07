import type React from "react";
import BottomNavigation from "./BottomNavigation";
import CoinGemHeader from "./CoinGemHeader";

type AppPage =
  | "login"
  | "onboarding"
  | "worldmap"
  | "worlddetail"
  | "lesson"
  | "results"
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

interface LayoutProps {
  children: React.ReactNode;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const HIDE_CHROME_PAGES: AppPage[] = ["login", "onboarding"];

export default function Layout({
  children,
  currentPage,
  onNavigate,
}: LayoutProps) {
  const hideChrome = HIDE_CHROME_PAGES.includes(currentPage);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CoinGemHeader currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto pb-20 pt-16">{children}</main>
      <BottomNavigation currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
