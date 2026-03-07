import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Lesson } from "../backend";
import RPGButton from "../components/RPGButton";
import BossEntranceAnimation from "../components/animations/BossEntranceAnimation";
import CoinGemAnimation from "../components/animations/CoinGemAnimation";
import LevelUpAnimation from "../components/animations/LevelUpAnimation";
import XPGainAnimation from "../components/animations/XPGainAnimation";
import { Skeleton } from "../components/ui/skeleton";
import {
  WORLD_NAME_TO_ID,
  useGetUser,
  useGetWorldLessons,
  useRecordLessonResult,
  useRecordProgress,
} from "../hooks/useQueries";
import { WORLD_THEMES, getLevelFromXP } from "../lib/gameData";
import { loadUserId, recordLessonCompletion } from "../lib/userStore";

export interface LessonSessionStats {
  worldId: string;
  worldName: string;
  totalXPEarned: number;
  coinsEarned: number;
  score: number;
  totalQuestions: number;
}

interface LessonPageProps {
  worldId: string;
  userId: string;
  startIndex?: number;
  onBack: () => void;
  onComplete: (stats: LessonSessionStats) => void;
}

// Map worldId to world name for progress recording
const WORLD_ID_TO_NAME: Record<string, string> = {
  world1: "Alphabet Forest",
  world2: "Grammar City",
  world3: "Math Valley",
  world4: "Algebra Mountains",
  world5: "Master Volcano",
};

export default function LessonPage({
  worldId,
  userId: propUserId,
  startIndex,
  onBack,
  onComplete,
}: LessonPageProps) {
  const userId = propUserId || loadUserId() || "";
  // Resolve worldId: support both "world1" style IDs and world names like "Alphabet Forest"
  const resolvedWorldId = WORLD_NAME_TO_ID[worldId] || worldId;
  const { data: lessons, isLoading } = useGetWorldLessons(resolvedWorldId);
  const { data: user } = useGetUser(userId);
  const recordResult = useRecordLessonResult();
  const recordProgress = useRecordProgress();

  const [currentLessonIndex, setCurrentLessonIndex] = useState(startIndex ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showBoss, setShowBoss] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [coinsGained, setCoinsGained] = useState(0);
  const [newLevel, setNewLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);

  const currentLesson: Lesson | undefined = lessons?.[currentLessonIndex];

  useEffect(() => {
    if (currentLesson?.isBossBattle) {
      setShowBoss(true);
    }
  }, [currentLesson]);

  const handleAnswer = async (answer: string) => {
    if (isAnswered || !currentLesson) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentLesson.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);
    setTotalAnswered(totalAnswered + 1);

    if (isCorrect && userId) {
      try {
        const xp = Number(currentLesson.xpReward);
        const coins = Number(currentLesson.coinReward);
        const worldName = WORLD_ID_TO_NAME[resolvedWorldId] || resolvedWorldId;

        await Promise.all([
          recordResult.mutateAsync({
            userId,
            lessonId: currentLesson.id,
            score: BigInt(1),
          }),
          recordProgress.mutateAsync({
            userId,
            lessonName: currentLesson.title,
            worldName,
            score: BigInt(100),
            xpEarned: currentLesson.xpReward,
          }),
        ]);
        recordLessonCompletion(resolvedWorldId);

        setXpGained(xp);
        setCoinsGained(coins);
        setTotalXPEarned((prev) => prev + xp);
        setTotalCoinsEarned((prev) => prev + coins);

        // Check for level up
        if (user) {
          const oldLevel = Number(user.level);
          const newXP = Number(user.xp) + xp;
          const calculatedNewLevel = getLevelFromXP(newXP);
          if (calculatedNewLevel > oldLevel) {
            setNewLevel(calculatedNewLevel);
            setTimeout(() => setShowLevelUp(true), 1600);
          }
        }

        setShowXP(true);
        if (coins > 0) {
          setTimeout(() => setShowCoins(true), 500);
        }
      } catch (error) {
        console.error("Failed to record lesson result:", error);
      }
    } else if (!isCorrect && userId) {
      // Record wrong attempt with score 0
      try {
        const worldName = WORLD_ID_TO_NAME[resolvedWorldId] || resolvedWorldId;
        await recordProgress.mutateAsync({
          userId,
          lessonName: currentLesson.title,
          worldName,
          score: BigInt(0),
          xpEarned: BigInt(0),
        });
      } catch (error) {
        console.error("Failed to record wrong answer progress:", error);
      }
    }
  };

  const handleNext = () => {
    if (!lessons) return;
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      onComplete({
        worldId: resolvedWorldId,
        worldName: WORLD_ID_TO_NAME[resolvedWorldId] || resolvedWorldId,
        totalXPEarned,
        coinsEarned: totalCoinsEarned,
        score,
        totalQuestions: lessons.length,
      });
    }
  };

  const getAnswerClass = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? "border-gold bg-gold/10"
        : "border-border bg-card hover:border-gold/50 cursor-pointer";
    }
    if (option === currentLesson?.correctAnswer) {
      return "border-emerald-500 bg-emerald-500/10";
    }
    if (option === selectedAnswer && option !== currentLesson?.correctAnswer) {
      return "border-red-500 bg-red-500/10";
    }
    return "border-border bg-card opacity-50";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="font-heading text-2xl text-gold mb-2">No Lessons Yet</h2>
        <p className="text-muted-foreground text-center mb-6">
          This world doesn't have any lessons yet. Check back soon!
        </p>
        <RPGButton variant="navy" onClick={onBack}>
          ← Back to Map
        </RPGButton>
      </div>
    );
  }

  if (!currentLesson) return null;

  const options = [
    { key: "A", value: currentLesson.optionA },
    { key: "B", value: currentLesson.optionB },
    { key: "C", value: currentLesson.optionC },
    { key: "D", value: currentLesson.optionD },
  ];

  const isLastLesson = currentLessonIndex === lessons.length - 1;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* Animations */}
      {showBoss && (
        <BossEntranceAnimation
          bossName={currentLesson.title}
          onComplete={() => setShowBoss(false)}
        />
      )}
      {showXP && (
        <XPGainAnimation
          amount={xpGained}
          onComplete={() => setShowXP(false)}
        />
      )}
      {showLevelUp && (
        <LevelUpAnimation
          newLevel={newLevel}
          onComplete={() => setShowLevelUp(false)}
        />
      )}
      {showCoins && (
        <CoinGemAnimation
          coins={coinsGained}
          onComplete={() => setShowCoins(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Lesson {currentLessonIndex + 1} / {lessons.length}
            </span>
            <span className="text-sm text-gold font-bold">
              {score}/{totalAnswered} correct
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-1">
            <div
              className="bg-gold h-2 rounded-full transition-all"
              style={{
                width: `${(currentLessonIndex / lessons.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Lesson info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-gold/20 text-gold border border-gold/30 rounded-full px-2 py-0.5">
            +{Number(currentLesson.xpReward)} XP
          </span>
          {currentLesson.coinReward > 0 && (
            <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-600/30 rounded-full px-2 py-0.5">
              +{Number(currentLesson.coinReward)} 🪙
            </span>
          )}
          {currentLesson.isBossBattle && (
            <span className="text-xs bg-red-900/30 text-red-400 border border-red-600/30 rounded-full px-2 py-0.5">
              ⚔️ Boss Battle
            </span>
          )}
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          {currentLesson.title}
        </h2>
      </div>

      {/* Question */}
      <div className="bg-card border-2 border-gold/30 rounded-2xl p-5 mb-6">
        <p className="text-foreground text-lg leading-relaxed">
          {currentLesson.question}
        </p>
      </div>

      {/* Answer options */}
      <div className="space-y-3 mb-6">
        {options.map(({ key, value }) => (
          <button
            type="button"
            key={key}
            onClick={() => handleAnswer(key)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${getAnswerClass(key)}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm flex-shrink-0">
                {key}
              </span>
              <span className="text-foreground">{value}</span>
              {isAnswered && key === currentLesson.correctAnswer && (
                <CheckCircle
                  size={18}
                  className="text-emerald-500 ml-auto flex-shrink-0"
                />
              )}
              {isAnswered &&
                key === selectedAnswer &&
                key !== currentLesson.correctAnswer && (
                  <XCircle
                    size={18}
                    className="text-red-500 ml-auto flex-shrink-0"
                  />
                )}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback & Next */}
      {isAnswered && (
        <div className="space-y-3">
          <div
            className={`p-4 rounded-xl border-2 text-center font-heading font-bold ${
              selectedAnswer === currentLesson.correctAnswer
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-red-500 bg-red-500/10 text-red-400"
            }`}
          >
            {selectedAnswer === currentLesson.correctAnswer
              ? "✅ Correct! Well done!"
              : `❌ The correct answer was: ${currentLesson.correctAnswer}`}
          </div>
          <RPGButton
            variant={isLastLesson ? "gold" : "emerald"}
            size="lg"
            className="w-full"
            onClick={handleNext}
          >
            {isLastLesson ? "🏆 Complete World!" : "Next Question →"}
          </RPGButton>
        </div>
      )}
    </div>
  );
}
