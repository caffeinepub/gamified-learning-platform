import React from "react";
import { useGetUser } from "../hooks/useQueries";
import { loadUserId } from "../lib/userStore";

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

interface CoinGemHeaderProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export default function CoinGemHeader({ onNavigate }: CoinGemHeaderProps) {
  const userId = loadUserId() || "";
  const { data: user } = useGetUser(userId);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/95 backdrop-blur-sm border-b border-gold/30 h-16">
      <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
        {/* Branding */}
        <button
          type="button"
          onClick={() => onNavigate("worldmap")}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">⚔️</span>
          <span className="font-heading text-gold text-lg font-bold tracking-wide">
            EduQuest
          </span>
        </button>

        {/* Balances */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-900/40 border border-gold/40 rounded-full px-3 py-1">
            <img
              src="/assets/generated/icon-coin.dim_64x64.png"
              alt="coins"
              className="w-5 h-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-gold font-bold text-sm">
              {user ? Number(user.coins).toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-900/40 border border-purple-400/40 rounded-full px-3 py-1">
            <img
              src="/assets/generated/icon-gem.dim_64x64.png"
              alt="gems"
              className="w-5 h-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-purple-300 font-bold text-sm">
              {user ? Number(user.gems).toLocaleString() : "—"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
