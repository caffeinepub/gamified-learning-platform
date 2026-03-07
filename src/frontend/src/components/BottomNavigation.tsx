import {
  Bot,
  Flame,
  Gift,
  Map as MapIcon,
  ScrollText,
  ShoppingBag,
  Swords,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import type React from "react";

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

interface BottomNavigationProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const NAV_ITEMS: { page: AppPage; icon: React.ReactNode; label: string }[] = [
  { page: "worldmap", icon: <MapIcon size={20} />, label: "Map" },
  { page: "skilltree", icon: <Zap size={20} />, label: "Skills" },
  { page: "dailyquests", icon: <Target size={20} />, label: "Quests" },
  { page: "streak", icon: <Flame size={20} />, label: "Streak" },
  { page: "multiplayer", icon: <Swords size={20} />, label: "Battle" },
  { page: "tutor", icon: <Bot size={20} />, label: "Tutor" },
  { page: "progress", icon: <ScrollText size={20} />, label: "Log" },
  { page: "rewards", icon: <Gift size={20} />, label: "Rewards" },
  { page: "shop", icon: <ShoppingBag size={20} />, label: "Shop" },
  { page: "leaderboard", icon: <Trophy size={20} />, label: "Ranks" },
  { page: "profile", icon: <User size={20} />, label: "Profile" },
];

export default function BottomNavigation({
  currentPage,
  onNavigate,
}: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy-dark border-t border-gold/30 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const isActive =
            currentPage === page ||
            (currentPage === "lesson" && page === "worldmap") ||
            (currentPage === "worlddetail" && page === "worldmap");
          return (
            <button
              type="button"
              key={page}
              onClick={() => onNavigate(page)}
              data-ocid={`nav.${page}.link`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[52px] transition-all duration-200 ${
                isActive
                  ? "text-gold bg-gold/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <span className={isActive ? "text-gold" : ""}>{icon}</span>
              <span className="text-[9px] font-medium leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
