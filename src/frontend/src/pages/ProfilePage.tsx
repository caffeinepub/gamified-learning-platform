import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Zap } from "lucide-react";
import React, { useState } from "react";
import { Subject } from "../backend";
import RPGButton from "../components/RPGButton";
import LevelUpAnimation from "../components/animations/LevelUpAnimation";
import { Badge } from "../components/ui/badge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUser, useGetUserPurchases } from "../hooks/useQueries";
import { AVATAR_OPTIONS, getXPProgress } from "../lib/gameData";
import { clearUserId, loadUserId } from "../lib/userStore";

interface ProfilePageProps {
  userId: string;
  onLogout: () => void;
}

export default function ProfilePage({
  userId: propUserId,
  onLogout,
}: ProfilePageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: user, isLoading } = useGetUser(userId);
  const { data: purchases = [] } = useGetUserPurchases(userId);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleLogout = async () => {
    await clear();
    clearUserId();
    queryClient.clear();
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="text-5xl">👤</div>
        <p className="font-heading text-xl text-gold">Profile not found</p>
        <p className="text-muted-foreground text-sm text-center">
          Your game profile hasn't been created yet.
        </p>
      </div>
    );
  }

  const avatarOption =
    AVATAR_OPTIONS.find((a) => a.id === user.avatarId) || AVATAR_OPTIONS[0];
  const level = Number(user.level);
  const xp = Number(user.xp);
  const xpProgressData = getXPProgress(xp);
  const xpPercent = xpProgressData.percentage;

  const mathProgress =
    user.subjectProgress.find(([s]) => s === Subject.math)?.[1] ?? BigInt(0);
  const englishProgress =
    user.subjectProgress.find(([s]) => s === Subject.english)?.[1] ?? BigInt(0);

  const costumePurchases = purchases.filter(
    (p) => p.itemType === "avatarCostume",
  );

  const achievements = [
    { emoji: "⚔️", label: "First Battle", earned: xp > 0 },
    { emoji: "🔥", label: "On Fire", earned: Number(user.streakDays) >= 3 },
    { emoji: "📚", label: "Scholar", earned: xp >= 500 },
    { emoji: "🏆", label: "Champion", earned: level >= 5 },
    { emoji: "💎", label: "Gem Collector", earned: Number(user.gems) >= 10 },
    { emoji: "🌟", label: "Legend", earned: level >= 10 },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex flex-col gap-5">
      {showLevelUp && (
        <LevelUpAnimation
          newLevel={level}
          onComplete={() => setShowLevelUp(false)}
        />
      )}

      {/* Avatar & Name */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden border-4 border-gold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.06 265), oklch(0.18 0.04 265))",
            }}
          >
            <img
              src={avatarOption.image}
              alt={avatarOption.name}
              className="w-24 h-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm bg-gold text-navy-dark border-2 border-background">
            {level}
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-gold">
            {user.username}
          </h2>
          <p className="text-muted-foreground text-sm">
            {avatarOption.name} · Age {Number(user.age)}
          </p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="max-w-sm mx-auto w-full bg-card border border-gold/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-emerald-400" />
            <span className="font-bold text-sm text-emerald-400">
              {xp.toLocaleString()} XP
            </span>
          </div>
          <span className="font-bold text-sm text-gold">Level {level}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-gold h-3 rounded-full transition-all"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right mt-1">
          {xpProgressData.current}/{xpProgressData.needed} XP to Level{" "}
          {level + 1}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto w-full">
        <div className="bg-card border border-gold/20 rounded-2xl flex flex-col items-center gap-1 py-3">
          <img
            src="/assets/generated/icon-coin.dim_64x64.png"
            alt="coins"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <p className="font-heading font-bold text-lg text-gold">
            {Number(user.coins).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Coins</p>
        </div>
        <div className="bg-card border border-gold/20 rounded-2xl flex flex-col items-center gap-1 py-3">
          <img
            src="/assets/generated/icon-gem.dim_64x64.png"
            alt="gems"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <p className="font-heading font-bold text-lg text-purple-400">
            {Number(user.gems).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Gems</p>
        </div>
        <div className="bg-card border border-gold/20 rounded-2xl flex flex-col items-center gap-1 py-3">
          <img
            src="/assets/generated/icon-streak.dim_64x64.png"
            alt="streak"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <p className="font-heading font-bold text-lg text-orange-400">
            {Number(user.streakDays)}
          </p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="max-w-sm mx-auto w-full bg-card border border-gold/20 rounded-2xl p-4">
        <p className="font-heading font-bold text-foreground mb-3">
          📊 Subject Progress
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">
                🔢 Math
              </span>
              <span className="text-xs text-muted-foreground">
                {Number(mathProgress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Number(mathProgress)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">
                📚 English
              </span>
              <span className="text-xs text-muted-foreground">
                {Number(englishProgress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${Number(englishProgress)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="max-w-sm mx-auto w-full bg-card border border-gold/20 rounded-2xl p-4">
        <p className="font-heading font-bold text-foreground mb-3">
          🏅 Achievements
        </p>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((ach) => (
            <div
              key={ach.label}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                ach.earned
                  ? "border-gold/40 bg-gold/10"
                  : "border-border/30 bg-background opacity-40"
              }`}
            >
              <span className="text-2xl">{ach.emoji}</span>
              <span className="text-[10px] text-center leading-tight text-muted-foreground">
                {ach.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Purchased Costumes */}
      {costumePurchases.length > 0 && (
        <div className="max-w-sm mx-auto w-full bg-card border border-gold/20 rounded-2xl p-4">
          <p className="font-heading font-bold text-foreground mb-3">
            👗 Costumes
          </p>
          <div className="flex gap-2 flex-wrap">
            {costumePurchases.map((p) => (
              <Badge key={p.id} variant="outline" className="text-xs">
                ✨ {p.itemId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="max-w-sm mx-auto w-full">
        <RPGButton
          variant="crimson"
          size="md"
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut size={16} className="inline mr-2" />
          Logout
        </RPGButton>
      </div>

      {/* Footer */}
      <footer className="text-center pt-2 pb-4">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
