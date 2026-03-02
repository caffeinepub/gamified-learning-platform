import React, { useEffect } from 'react';
import { useGetStreakStatus, useRecordLogin, useClaimStreakReward, useGetUser } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { STREAK_MILESTONES } from '@/lib/gameData';
import RPGButton from '@/components/RPGButton';
import CoinGemAnimation from '@/components/animations/CoinGemAnimation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useState } from 'react';

export default function StreakTrackerPage() {
  const userId = loadUserId();
  const { data: streak, isLoading, refetch } = useGetStreakStatus(userId);
  const { data: user } = useGetUser(userId);
  const recordLogin = useRecordLogin();
  const claimReward = useClaimStreakReward();
  const [showCoins, setShowCoins] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [rewardGems, setRewardGems] = useState(0);

  // Record login on mount
  useEffect(() => {
    if (userId) {
      recordLogin.mutate(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const currentStreak = streak ? Number(streak.currentStreak) : 0;
  const longestStreak = streak ? Number(streak.longestStreak) : 0;

  const handleClaimReward = async () => {
    if (!userId) return;
    try {
      const message = await claimReward.mutateAsync(userId);
      // Parse reward from message
      const coinMatch = message.match(/(\d+) coins/);
      const gemMatch = message.match(/(\d+) gems/);
      const coins = coinMatch ? parseInt(coinMatch[1]) : 0;
      const gems = gemMatch ? parseInt(gemMatch[1]) : 0;
      if (coins > 0 || gems > 0) {
        setRewardCoins(coins);
        setRewardGems(gems);
        setShowCoins(true);
      }
      toast.success(message);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes('trap') ? 'No reward available right now.' : msg);
    }
  };

  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > currentStreak);
  const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0;

  return (
    <div className="px-4 py-6">
      <Toaster />
      {showCoins && (
        <CoinGemAnimation
          coins={rewardCoins}
          gems={rewardGems}
          onComplete={() => setShowCoins(false)}
        />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🔥 Streak Tracker
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Keep your streak alive for amazing rewards!
        </p>
      </div>

      {/* Main streak display */}
      <div
        className="rpg-card rpg-card-gold flex flex-col items-center gap-4 py-8 mb-6"
        style={{ textAlign: 'center' }}
      >
        <div className="streak-fire">
          <img
            src="/assets/generated/icon-streak.dim_64x64.png"
            alt="streak"
            className="w-20 h-20 object-contain"
          />
        </div>
        <div>
          <p
            className="font-heading text-7xl font-bold"
            style={{
              background: 'linear-gradient(135deg, oklch(0.85 0.2 65), oklch(0.78 0.22 45))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {currentStreak}
          </p>
          <p className="font-heading text-xl" style={{ color: 'oklch(0.88 0.14 85)' }}>
            Day Streak!
          </p>
        </div>
        {longestStreak > 0 && (
          <p className="text-muted-foreground font-body text-sm">
            🏆 Best streak: {longestStreak} days
          </p>
        )}
        {nextMilestone && (
          <p className="font-body text-sm" style={{ color: 'oklch(0.65 0.15 220)' }}>
            {daysToNext} more day{daysToNext !== 1 ? 's' : ''} until {nextMilestone.label} reward!
          </p>
        )}
      </div>

      {/* Milestone markers */}
      <div className="flex flex-col gap-3 mb-6">
        <p className="font-heading text-lg font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🎁 Milestone Rewards
        </p>
        {STREAK_MILESTONES.map((milestone) => {
          const reached = currentStreak >= milestone.days;
          return (
            <div
              key={milestone.days}
              className="rpg-card flex items-center gap-4"
              style={
                reached
                  ? { borderColor: 'oklch(0.78 0.16 85 / 0.6)', background: 'oklch(0.2 0.05 85 / 0.2)' }
                  : {}
              }
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: reached ? 'oklch(0.78 0.16 85 / 0.3)' : 'oklch(0.22 0.04 265)',
                  border: `2px solid ${reached ? 'oklch(0.78 0.16 85)' : 'oklch(0.35 0.05 265)'}`,
                }}
              >
                {reached ? '✅' : milestone.emoji}
              </div>
              <div className="flex-1">
                <p
                  className="font-heading font-bold text-sm"
                  style={{ color: reached ? 'oklch(0.88 0.14 85)' : 'oklch(0.65 0.04 265)' }}
                >
                  {milestone.label} — {milestone.reward}
                </p>
                <div className="xp-bar mt-1" style={{ height: '6px' }}>
                  <div
                    className="xp-bar-fill"
                    style={{ width: `${Math.min(100, (currentStreak / milestone.days) * 100)}%` }}
                  />
                </div>
              </div>
              <span
                className="font-heading font-bold text-sm"
                style={{ color: reached ? 'oklch(0.62 0.2 155)' : 'oklch(0.45 0.04 265)' }}
              >
                {currentStreak}/{milestone.days}
              </span>
            </div>
          );
        })}
      </div>

      {/* Claim reward button */}
      {currentStreak >= 3 && (
        <RPGButton
          variant="gold"
          size="lg"
          onClick={handleClaimReward}
          loading={claimReward.isPending}
          className="w-full"
        >
          🎁 Claim Streak Reward!
        </RPGButton>
      )}

      {currentStreak === 0 && (
        <div className="rpg-card text-center py-6">
          <p className="font-heading text-lg mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
            Start Your Streak Today!
          </p>
          <p className="text-muted-foreground font-body text-sm">
            Visit EduQuest every day to build your streak and earn rewards.
          </p>
        </div>
      )}
    </div>
  );
}
