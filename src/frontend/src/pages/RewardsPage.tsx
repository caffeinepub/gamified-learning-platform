import { CheckCircle, Gift } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import RPGButton from "../components/RPGButton";
import CoinGemAnimation from "../components/animations/CoinGemAnimation";
import { useGetUser } from "../hooks/useQueries";
import { loadUserId } from "../lib/userStore";

interface RewardsPageProps {
  userId: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardType: "coins" | "gems" | "xp" | "badge";
  value: number;
}

// Seeded rewards matching the 3 canonical rewards
const SEEDED_REWARDS: Reward[] = [
  {
    id: "reward_welcome",
    title: "Welcome Hero!",
    description: "A reward for starting your EduQuest adventure",
    icon: "🎁",
    rewardType: "coins",
    value: 100,
  },
  {
    id: "reward_first_lesson",
    title: "First Lesson",
    description: "Complete your first lesson to claim this reward",
    icon: "📚",
    rewardType: "xp",
    value: 50,
  },
  {
    id: "reward_explorer",
    title: "World Explorer",
    description: "Unlock your first new world to earn this badge",
    icon: "🗺️",
    rewardType: "gems",
    value: 10,
  },
];

export default function RewardsPage({ userId: propUserId }: RewardsPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: user } = useGetUser(userId);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [showCoins, setShowCoins] = useState(false);
  const [showGems, setShowGems] = useState(false);
  const [animCoins, setAnimCoins] = useState(0);
  const [animGems, setAnimGems] = useState(0);

  const handleClaim = (reward: Reward) => {
    if (claimedIds.has(reward.id)) return;
    setClaimedIds((prev) => new Set([...prev, reward.id]));

    if (reward.rewardType === "coins") {
      setAnimCoins(reward.value);
      setShowCoins(true);
      toast.success(`Claimed ${reward.value} coins! 🪙`);
    } else if (reward.rewardType === "gems") {
      setAnimGems(reward.value);
      setShowGems(true);
      toast.success(`Claimed ${reward.value} gems! 💎`);
    } else if (reward.rewardType === "xp") {
      toast.success(`Claimed ${reward.value} XP! ⭐`);
    } else {
      toast.success(`Badge claimed! ${reward.icon}`);
    }
  };

  const getRewardColor = (type: Reward["rewardType"]) => {
    switch (type) {
      case "coins":
        return "text-amber-400";
      case "gems":
        return "text-purple-400";
      case "xp":
        return "text-emerald-400";
      case "badge":
        return "text-gold";
      default:
        return "text-foreground";
    }
  };

  const getRewardLabel = (reward: Reward) => {
    switch (reward.rewardType) {
      case "coins":
        return `+${reward.value} 🪙`;
      case "gems":
        return `+${reward.value} 💎`;
      case "xp":
        return `+${reward.value} XP`;
      case "badge":
        return "🏅 Badge";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {showCoins && (
        <CoinGemAnimation
          coins={animCoins}
          onComplete={() => {
            setShowCoins(false);
            setAnimCoins(0);
          }}
        />
      )}
      {showGems && (
        <CoinGemAnimation
          gems={animGems}
          onComplete={() => {
            setShowGems(false);
            setAnimGems(0);
          }}
        />
      )}

      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">Rewards</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Claim your hard-earned rewards!
        </p>
      </div>

      {/* User stats */}
      {user && (
        <div className="max-w-sm mx-auto bg-card border border-gold/20 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-heading font-bold text-lg text-gold">
                {Number(user.coins)}
              </div>
              <div className="text-xs text-muted-foreground">Coins</div>
            </div>
            <div>
              <div className="font-heading font-bold text-lg text-purple-400">
                {Number(user.gems)}
              </div>
              <div className="text-xs text-muted-foreground">Gems</div>
            </div>
            <div>
              <div className="font-heading font-bold text-lg text-emerald-400">
                {Number(user.xp)}
              </div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Rewards list */}
      <div className="space-y-4 max-w-sm mx-auto">
        {SEEDED_REWARDS.map((reward) => {
          const isClaimed = claimedIds.has(reward.id);
          return (
            <div
              key={reward.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                isClaimed
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-gold/30 bg-card"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                    isClaimed ? "bg-emerald-500/20" : "bg-gold/10"
                  }`}
                >
                  {isClaimed ? "✅" : reward.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-foreground">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {reward.description}
                  </p>
                  <div
                    className={`text-sm font-bold mt-1 ${getRewardColor(reward.rewardType)}`}
                  >
                    {getRewardLabel(reward)}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                {isClaimed ? (
                  <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-sm">
                      Claimed!
                    </span>
                  </div>
                ) : (
                  <RPGButton
                    variant="gold"
                    size="sm"
                    className="w-full"
                    onClick={() => handleClaim(reward)}
                  >
                    <Gift size={14} className="inline mr-1" />
                    Claim Reward
                  </RPGButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 max-w-sm mx-auto bg-card border border-gold/20 rounded-2xl p-4">
        <h3 className="font-heading font-bold text-foreground mb-2">
          About Rewards
        </h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Complete quests and lessons to earn rewards</li>
          <li>• Each reward can only be claimed once</li>
          <li>• Coins and gems can be spent in the Shop</li>
          <li>• XP helps you level up and unlock new worlds</li>
        </ul>
      </div>

      {/* Footer */}
      <footer className="text-center pt-6 pb-2">
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
