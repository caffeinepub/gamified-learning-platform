import { CheckCircle, Clock, Target } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import RPGButton from "../components/RPGButton";
import CoinGemAnimation from "../components/animations/CoinGemAnimation";
import { Skeleton } from "../components/ui/skeleton";
import { useCompleteQuest, useGetDailyQuests } from "../hooks/useQueries";
import { getCompletedLessonCount, loadUserId } from "../lib/userStore";

interface DailyQuestsPageProps {
  userId: string;
}

// Map quest titles to world IDs for progress tracking
const QUEST_WORLD_MAP: Record<string, string> = {
  "Restore Letters": "world1",
  "Word Builder": "world1",
  "Grammar Fix": "world2",
  "Math Rescue": "world3",
};

// Per-quest required lesson counts
const QUEST_REQUIRED_LESSONS: Record<string, number> = {
  "Restore Letters": 2,
  "Word Builder": 3,
  "Grammar Fix": 2,
  "Math Rescue": 2,
};

export default function DailyQuestsPage({
  userId: propUserId,
}: DailyQuestsPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: quests, isLoading } = useGetDailyQuests(userId);
  const completeQuest = useCompleteQuest();
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(
    new Set(),
  );
  const [showCoins, setShowCoins] = useState(false);
  const [coinReward, setCoinReward] = useState(0);

  const handleComplete = async (
    questId: string,
    questTitle: string,
    coinRewardAmount: number,
  ) => {
    if (!userId || completedQuestIds.has(questId)) return;
    try {
      await completeQuest.mutateAsync({ userId, questId });
      setCompletedQuestIds((prev) => new Set([...prev, questId]));
      setCoinReward(coinRewardAmount);
      setShowCoins(true);
      toast.success(`Quest "${questTitle}" completed! 🎉`);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to complete quest";
      if (msg.includes("already completed")) {
        setCompletedQuestIds((prev) => new Set([...prev, questId]));
        toast.info("Quest already completed!");
      } else {
        toast.error(msg);
      }
    }
  };

  const getQuestProgress = (questTitle: string) => {
    const worldId = QUEST_WORLD_MAP[questTitle];
    const required = QUEST_REQUIRED_LESSONS[questTitle] ?? 2;
    if (!worldId) return { completed: 0, required };
    const completed = getCompletedLessonCount(worldId);
    return {
      completed: Math.min(completed, required),
      required,
    };
  };

  const formatTimeLeft = (expiresAt: bigint) => {
    const now = Date.now();
    const expiry = Number(expiresAt) / 1_000_000; // nanoseconds to ms
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {showCoins && (
        <CoinGemAnimation
          coins={coinReward}
          onComplete={() => setShowCoins(false)}
        />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">
          Daily Quests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete quests to earn rewards
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-sm mx-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : !quests || quests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="font-heading text-xl text-gold mb-2">
            No Active Quests
          </h2>
          <p className="text-muted-foreground">
            Check back tomorrow for new quests!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-sm mx-auto">
          {quests.map((quest) => {
            const progress = getQuestProgress(quest.title);
            const isCompleted = completedQuestIds.has(quest.id);
            const canComplete =
              progress.completed >= progress.required && !isCompleted;

            return (
              <div
                key={quest.id}
                className={`rounded-2xl border-2 p-4 transition-all ${
                  isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-gold/30 bg-card"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? "bg-emerald-500/20" : "bg-gold/20"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-emerald-400" />
                    ) : (
                      <Target size={20} className="text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-foreground">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quest.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>
                      {progress.completed}/{progress.required} lessons
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? "bg-emerald-500" : "bg-gold"
                      }`}
                      style={{
                        width: `${(progress.completed / progress.required) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Rewards & timer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gold font-bold">
                      +{Number(quest.xpReward)} XP
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      +{Number(quest.coinReward)} 🪙
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{formatTimeLeft(quest.expiresAt)}</span>
                    </div>
                  </div>
                  {!isCompleted && (
                    <RPGButton
                      variant={canComplete ? "gold" : "navy"}
                      size="sm"
                      disabled={!canComplete}
                      loading={completeQuest.isPending}
                      onClick={() =>
                        handleComplete(
                          quest.id,
                          quest.title,
                          Number(quest.coinReward),
                        )
                      }
                    >
                      {canComplete ? "Claim!" : "In Progress"}
                    </RPGButton>
                  )}
                  {isCompleted && (
                    <span className="text-xs text-emerald-400 font-bold">
                      ✓ Claimed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 max-w-sm mx-auto bg-card border border-gold/20 rounded-2xl p-4">
        <h3 className="font-heading font-bold text-foreground mb-2">
          How Quests Work
        </h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Complete lessons in the linked world to make progress</li>
          <li>• Each quest has its own required lesson count (2–3 lessons)</li>
          <li>• Claim your reward before the quest expires</li>
          <li>• New quests refresh daily</li>
        </ul>
      </div>
    </div>
  );
}
