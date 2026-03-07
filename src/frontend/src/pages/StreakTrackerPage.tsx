import { Flame } from "lucide-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
import RPGButton from "../components/RPGButton";
import CoinGemAnimation from "../components/animations/CoinGemAnimation";
import { Skeleton } from "../components/ui/skeleton";
import {
  useClaimStreakReward,
  useGetStreakStatus,
  useRecordLogin,
} from "../hooks/useQueries";
import { STREAK_MILESTONES } from "../lib/gameData";
import { loadUserId } from "../lib/userStore";

interface StreakTrackerPageProps {
  userId: string;
}

export default function StreakTrackerPage({
  userId: propUserId,
}: StreakTrackerPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: streak, isLoading } = useGetStreakStatus(userId);
  const claimReward = useClaimStreakReward();
  const recordLogin = useRecordLogin();
  const { mutate: recordLoginMutate } = recordLogin;
  const [showCoins, setShowCoins] = useState(false);
  const [coinReward, setCoinReward] = useState(0);
  const [gemReward, setGemReward] = useState(0);

  useEffect(() => {
    if (userId) {
      recordLoginMutate(userId);
    }
  }, [userId, recordLoginMutate]);

  const handleClaimReward = async () => {
    if (!userId) return;
    try {
      const message = await claimReward.mutateAsync(userId);
      // Parse reward from message
      const coinMatch = message.match(/(\d+) coins/);
      const gemMatch = message.match(/(\d+) gems/);
      if (coinMatch) setCoinReward(Number.parseInt(coinMatch[1]));
      if (gemMatch) setGemReward(Number.parseInt(gemMatch[1]));
      setShowCoins(true);
      toast.success(message);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to claim reward";
      toast.error(msg);
    }
  };

  const currentStreak = streak ? Number(streak.currentStreak) : 0;
  const longestStreak = streak ? Number(streak.longestStreak) : 0;

  const getNextMilestone = () => {
    return STREAK_MILESTONES.find((m) => m.days > currentStreak);
  };

  const nextMilestone = getNextMilestone();
  const canClaim = currentStreak >= 3;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {showCoins && (
        <CoinGemAnimation
          coins={coinReward}
          gems={gemReward}
          onComplete={() => setShowCoins(false)}
        />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">
          Streak Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Keep your learning streak alive!
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-sm mx-auto">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="max-w-sm mx-auto space-y-4">
          {/* Current streak */}
          <div className="bg-card border-2 border-gold/40 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="/assets/generated/icon-streak.dim_64x64.png"
                alt="streak"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <Flame size={32} className="text-orange-400" />
            </div>
            <div className="font-heading text-6xl font-bold text-gold mb-1">
              {currentStreak}
            </div>
            <div className="text-muted-foreground">Day Streak</div>
            <div className="text-xs text-muted-foreground mt-1">
              Longest: {longestStreak} days
            </div>
          </div>

          {/* Next milestone */}
          {nextMilestone && (
            <div className="bg-card border border-gold/20 rounded-2xl p-4">
              <h3 className="font-heading font-bold text-foreground mb-2">
                Next Milestone
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{nextMilestone.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">
                      Day {nextMilestone.days}
                    </span>
                    <span className="text-gold">{nextMilestone.reward}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (currentStreak / nextMilestone.days) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {nextMilestone.days - currentStreak} days to go
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All milestones */}
          <div className="bg-card border border-gold/20 rounded-2xl p-4">
            <h3 className="font-heading font-bold text-foreground mb-3">
              Milestones
            </h3>
            <div className="space-y-3">
              {STREAK_MILESTONES.map((milestone) => {
                const achieved = currentStreak >= milestone.days;
                return (
                  <div
                    key={milestone.days}
                    className={`flex items-center gap-3 p-2 rounded-xl ${
                      achieved ? "bg-gold/10" : "opacity-50"
                    }`}
                  >
                    <span className="text-2xl">{milestone.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-foreground">
                        Day {milestone.days}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {milestone.reward}
                      </div>
                    </div>
                    {achieved && (
                      <span className="text-emerald-400 text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Claim button */}
          <RPGButton
            variant="gold"
            size="lg"
            className="w-full"
            disabled={!canClaim}
            loading={claimReward.isPending}
            onClick={handleClaimReward}
          >
            {canClaim
              ? "🎁 Claim Streak Reward"
              : `Keep going! ${3 - currentStreak} more days`}
          </RPGButton>
        </div>
      )}
    </div>
  );
}
