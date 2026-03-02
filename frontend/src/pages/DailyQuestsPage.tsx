import React, { useEffect, useState } from 'react';
import { useGetDailyQuests, useCompleteQuest, useGetUser } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { type Quest } from '@/backend';
import { Progress } from '@/components/ui/progress';
import RPGButton from '@/components/RPGButton';
import CoinGemAnimation from '@/components/animations/CoinGemAnimation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Clock, Star, Coins } from 'lucide-react';

function QuestCard({
  quest,
  onComplete,
  isCompleting,
  isCompleted,
}: {
  quest: Quest;
  onComplete: () => void;
  isCompleting: boolean;
  isCompleted: boolean;
}) {
  const now = Date.now();
  const expiresAt = Number(quest.expiresAt) / 1_000_000; // nanoseconds to ms
  const timeLeft = expiresAt - now;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div
      className="rpg-card flex flex-col gap-4"
      style={
        isCompleted
          ? { borderColor: 'oklch(0.55 0.18 155 / 0.5)', background: 'oklch(0.18 0.06 155 / 0.3)' }
          : {}
      }
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: isCompleted
              ? 'oklch(0.55 0.18 155 / 0.3)'
              : 'oklch(0.78 0.16 85 / 0.15)',
            border: `2px solid ${isCompleted ? 'oklch(0.55 0.18 155 / 0.5)' : 'oklch(0.78 0.16 85 / 0.3)'}`,
          }}
        >
          {isCompleted ? '✅' : '⚔️'}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-heading font-bold text-base"
            style={{ color: isCompleted ? 'oklch(0.62 0.2 155)' : 'oklch(0.97 0.01 265)' }}
          >
            {quest.title}
          </p>
          <p className="text-sm font-body text-muted-foreground mt-0.5">{quest.description}</p>
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚡</span>
          <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.62 0.2 155)' }}>
            +{Number(quest.xpReward)} XP
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <img src="/assets/generated/icon-coin.dim_64x64.png" alt="coins" className="w-4 h-4" />
          <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.88 0.14 85)' }}>
            +{Number(quest.coinReward)}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock size={12} className="text-muted-foreground" />
          <span className="text-xs font-body text-muted-foreground">
            {hoursLeft}h {minutesLeft}m left
          </span>
        </div>
      </div>

      {/* Progress bar (visual only, always 0 or 100) */}
      <div className="xp-bar">
        <div className="xp-bar-fill" style={{ width: isCompleted ? '100%' : '0%' }} />
      </div>

      {!isCompleted && (
        <RPGButton
          variant="emerald"
          size="sm"
          onClick={onComplete}
          loading={isCompleting}
          className="w-full"
        >
          Complete Quest! ⚔️
        </RPGButton>
      )}
      {isCompleted && (
        <p
          className="text-center font-heading font-bold text-sm"
          style={{ color: 'oklch(0.62 0.2 155)' }}
        >
          ✅ Quest Completed!
        </p>
      )}
    </div>
  );
}

export default function DailyQuestsPage() {
  const userId = loadUserId();
  const { data: quests = [], isLoading, refetch } = useGetDailyQuests(userId);
  const { data: user } = useGetUser(userId);
  const completeQuest = useCompleteQuest();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showCoins, setShowCoins] = useState(false);
  const [lastReward, setLastReward] = useState({ coins: 0, xp: 0 });

  const handleComplete = async (quest: Quest) => {
    if (!userId) return;
    setCompletingId(quest.id);
    try {
      await completeQuest.mutateAsync({ userId, questId: quest.id });
      setCompletedIds((prev) => new Set([...prev, quest.id]));
      setLastReward({ coins: Number(quest.coinReward), xp: Number(quest.xpReward) });
      setShowCoins(true);
      toast.success(`Quest complete! +${Number(quest.xpReward)} XP, +${Number(quest.coinReward)} coins! 🎉`);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already completed')) {
        setCompletedIds((prev) => new Set([...prev, quest.id]));
        toast.info('Quest already completed today!');
      } else {
        toast.error('Could not complete quest. Try again!');
      }
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="px-4 py-6">
      <Toaster />
      {showCoins && (
        <CoinGemAnimation
          coins={lastReward.coins}
          onComplete={() => setShowCoins(false)}
        />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          ⚔️ Daily Quests
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Complete quests to earn XP and coins!
        </p>
      </div>

      {/* User stats */}
      {user && (
        <div
          className="rpg-card rpg-card-gold flex items-center justify-around mb-6"
        >
          <div className="text-center">
            <p className="font-heading text-xl font-bold" style={{ color: 'oklch(0.62 0.2 155)' }}>
              {Number(user.xp).toLocaleString()}
            </p>
            <p className="text-xs font-body text-muted-foreground">Total XP</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
              {Number(user.coins).toLocaleString()}
            </p>
            <p className="text-xs font-body text-muted-foreground">Coins</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold" style={{ color: 'oklch(0.65 0.15 220)' }}>
              Lv.{Number(user.level)}
            </p>
            <p className="text-xs font-body text-muted-foreground">Level</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: 'oklch(0.78 0.16 85)', borderTopColor: 'transparent' }}
          />
          <p className="text-muted-foreground font-body text-sm">Loading quests...</p>
        </div>
      ) : quests.length === 0 ? (
        <div className="rpg-card text-center py-10">
          <div className="text-5xl mb-4">🌙</div>
          <p className="font-heading text-xl mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
            No Active Quests
          </p>
          <p className="text-muted-foreground font-body text-sm">
            Daily quests refresh at midnight UTC. Check back soon!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={() => handleComplete(quest)}
              isCompleting={completingId === quest.id}
              isCompleted={completedIds.has(quest.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
