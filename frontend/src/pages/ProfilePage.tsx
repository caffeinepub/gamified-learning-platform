import React, { useState } from 'react';
import { useGetUser, useGetUserPurchases } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { clearUserId } from '@/lib/userStore';
import { AVATAR_OPTIONS, getLevelFromXP, getXPProgress, DIFFICULTY_LABELS } from '@/lib/gameData';
import { Subject } from '@/backend';
import RPGButton from '@/components/RPGButton';
import LevelUpAnimation from '@/components/animations/LevelUpAnimation';
import { Badge } from '@/components/ui/badge';
import { LogOut, Star, Trophy, Zap } from 'lucide-react';

export default function ProfilePage() {
  const userId = loadUserId();
  const { data: user, isLoading } = useGetUser(userId);
  const { data: purchases = [] } = useGetUserPurchases(userId);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleLogout = async () => {
    await clear();
    clearUserId();
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{ borderColor: 'oklch(0.78 0.16 85)', borderTopColor: 'transparent' }}
        />
        <p className="text-muted-foreground font-body">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="text-5xl">👤</div>
        <p className="font-heading text-xl" style={{ color: 'oklch(0.88 0.14 85)' }}>
          Profile not found
        </p>
        <p className="text-muted-foreground font-body text-sm text-center">
          Your game profile hasn't been created yet.
        </p>
      </div>
    );
  }

  const avatarOption = AVATAR_OPTIONS.find((a) => a.id === user.avatarId) || AVATAR_OPTIONS[0];
  const level = Number(user.level);
  const xp = Number(user.xp);
  const xpProgress = getXPProgress(BigInt(xp));
  const xpPercent = (xpProgress / 1000) * 100;

  const mathProgress = user.subjectProgress.find(([s]) => s === Subject.math)?.[1] ?? BigInt(0);
  const englishProgress = user.subjectProgress.find(([s]) => s === Subject.english)?.[1] ?? BigInt(0);

  const costumePurchases = purchases.filter((p) => p.itemType === 'avatarCostume');

  const achievements = [
    { emoji: '⚔️', label: 'First Battle', earned: xp > 0 },
    { emoji: '🔥', label: 'On Fire', earned: Number(user.streakDays) >= 3 },
    { emoji: '📚', label: 'Scholar', earned: xp >= 500 },
    { emoji: '🏆', label: 'Champion', earned: level >= 5 },
    { emoji: '💎', label: 'Gem Collector', earned: Number(user.gems) >= 10 },
    { emoji: '🌟', label: 'Legend', earned: level >= 10 },
  ];

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      {showLevelUp && (
        <LevelUpAnimation newLevel={level} onComplete={() => setShowLevelUp(false)} />
      )}

      {/* Avatar & Name */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, oklch(0.22 0.06 265), oklch(0.18 0.04 265))',
              border: '4px solid oklch(0.78 0.16 85)',
              boxShadow: '0 0 30px oklch(0.78 0.16 85 / 0.4)',
            }}
          >
            <img
              src={avatarOption.image}
              alt={avatarOption.name}
              className="w-24 h-24 object-contain"
            />
          </div>
          <div
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, oklch(0.78 0.16 85), oklch(0.62 0.16 75))',
              border: '2px solid oklch(0.13 0.025 265)',
              color: 'oklch(0.13 0.025 265)',
            }}
          >
            {level}
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
            {user.username}
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            {avatarOption.name} • Age {Number(user.age)}
          </p>
        </div>
      </div>

      {/* XP Bar */}
      <div
        className="rpg-card rpg-card-gold flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: 'oklch(0.62 0.2 155)' }} />
            <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.62 0.2 155)' }}>
              {xp.toLocaleString()} XP
            </span>
          </div>
          <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.88 0.14 85)' }}>
            Level {level}
          </span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <p className="text-xs font-body text-muted-foreground text-right">
          {xpProgress}/1000 XP to Level {level + 1}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rpg-card flex flex-col items-center gap-1 py-3"
        >
          <img src="/assets/generated/icon-coin.dim_64x64.png" alt="coins" className="w-8 h-8" />
          <p className="font-heading font-bold text-lg" style={{ color: 'oklch(0.88 0.14 85)' }}>
            {Number(user.coins).toLocaleString()}
          </p>
          <p className="text-xs font-body text-muted-foreground">Coins</p>
        </div>
        <div
          className="rpg-card flex flex-col items-center gap-1 py-3"
        >
          <img src="/assets/generated/icon-gem.dim_64x64.png" alt="gems" className="w-8 h-8" />
          <p className="font-heading font-bold text-lg" style={{ color: 'oklch(0.75 0.18 265)' }}>
            {Number(user.gems).toLocaleString()}
          </p>
          <p className="text-xs font-body text-muted-foreground">Gems</p>
        </div>
        <div
          className="rpg-card flex flex-col items-center gap-1 py-3"
        >
          <img src="/assets/generated/icon-streak.dim_64x64.png" alt="streak" className="w-8 h-8 streak-fire" />
          <p className="font-heading font-bold text-lg" style={{ color: 'oklch(0.85 0.2 65)' }}>
            {Number(user.streakDays)}
          </p>
          <p className="text-xs font-body text-muted-foreground">Streak</p>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="rpg-card flex flex-col gap-4">
        <p className="font-heading text-base font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
          📊 Subject Progress
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-body text-sm font-semibold">🔢 Math</span>
              <span className="font-body text-xs text-muted-foreground">
                {Number(mathProgress)}%
              </span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{
                  width: `${Number(mathProgress)}%`,
                  background: 'linear-gradient(90deg, oklch(0.55 0.18 155), oklch(0.62 0.2 155))',
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-body text-sm font-semibold">📚 English</span>
              <span className="font-body text-xs text-muted-foreground">
                {Number(englishProgress)}%
              </span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{
                  width: `${Number(englishProgress)}%`,
                  background: 'linear-gradient(90deg, oklch(0.55 0.15 220), oklch(0.65 0.15 220))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rpg-card flex flex-col gap-3">
        <p className="font-heading text-base font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🏅 Achievements
        </p>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((ach) => (
            <div
              key={ach.label}
              className="flex flex-col items-center gap-1 p-2 rounded-xl"
              style={{
                background: ach.earned ? 'oklch(0.78 0.16 85 / 0.15)' : 'oklch(0.18 0.03 265)',
                border: `1px solid ${ach.earned ? 'oklch(0.78 0.16 85 / 0.4)' : 'oklch(0.28 0.04 265)'}`,
                opacity: ach.earned ? 1 : 0.4,
              }}
            >
              <span className="text-2xl">{ach.emoji}</span>
              <span className="text-[10px] font-body text-center leading-tight text-muted-foreground">
                {ach.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Purchased Costumes */}
      {costumePurchases.length > 0 && (
        <div className="rpg-card flex flex-col gap-3">
          <p className="font-heading text-base font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
            👗 Costumes
          </p>
          <div className="flex gap-2 flex-wrap">
            {costumePurchases.map((p) => (
              <Badge key={p.id} variant="outline" className="font-body text-xs">
                ✨ {p.itemId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <RPGButton variant="crimson" size="md" onClick={handleLogout} className="w-full">
        <LogOut size={16} className="mr-2" />
        Logout
      </RPGButton>

      {/* Footer */}
      <footer className="text-center pt-2 pb-4">
        <p className="text-muted-foreground text-xs font-body">
          © {new Date().getFullYear()} Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'eduquest-academy')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
