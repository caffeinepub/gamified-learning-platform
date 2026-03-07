import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";
import React from "react";
import RPGButton from "../components/RPGButton";
import { useGetAvailableWorlds, useGetUser } from "../hooks/useQueries";
import { WORLD_THEMES, getLevelFromXP } from "../lib/gameData";
import type { LessonSessionStats } from "./LessonPage";

interface LessonResultsPageProps {
  stats: LessonSessionStats;
  userId: string;
  onNextWorld: (worldId: string) => void;
  onReplay: () => void;
  onBackToMap: () => void;
}

// World name → display emoji fallback
const WORLD_EMOJI_FALLBACK: Record<string, string> = {
  world1: "🌲",
  world2: "🏙️",
  world3: "⛰️",
  world4: "🏔️",
  world5: "🌋",
};

const WORLD_GRADIENT_FALLBACK: Record<string, string> = {
  world1: "from-emerald-900 via-emerald-800 to-emerald-600",
  world2: "from-blue-900 via-blue-800 to-blue-600",
  world3: "from-amber-900 via-amber-800 to-amber-600",
  world4: "from-purple-900 via-purple-800 to-purple-600",
  world5: "from-red-900 via-red-800 to-red-600",
};

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

const glowVariants: Variants = {
  idle: { boxShadow: "0 0 20px 4px rgba(250,204,21,0.3)" },
  pulse: {
    boxShadow: [
      "0 0 20px 4px rgba(250,204,21,0.3)",
      "0 0 40px 12px rgba(250,204,21,0.55)",
      "0 0 20px 4px rgba(250,204,21,0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

const unlockBorderVariants: Variants = {
  idle: { opacity: 0.7 },
  pulse: {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function LessonResultsPage({
  stats,
  userId,
  onNextWorld,
  onReplay,
  onBackToMap,
}: LessonResultsPageProps) {
  const { data: user } = useGetUser(userId);
  const { data: worlds } = useGetAvailableWorlds(userId);

  const theme = WORLD_THEMES[stats.worldId] || {
    emoji: WORLD_EMOJI_FALLBACK[stats.worldId] || "🌍",
    bgClass: "from-navy-dark via-navy to-navy-light",
    color: "#facc15",
  };

  const worldEmoji = theme.emoji;
  const gradientClass =
    WORLD_GRADIENT_FALLBACK[stats.worldId] || "from-navy-dark to-navy";

  // Find the next world in sequence
  const sortedWorlds = worlds
    ? [...worlds].sort((a, b) => Number(a.order) - Number(b.order))
    : [];
  const currentWorldIndex = sortedWorlds.findIndex(
    (w) => w.id === stats.worldId,
  );
  const nextWorld =
    currentWorldIndex >= 0 ? sortedWorlds[currentWorldIndex + 1] : undefined;

  const currentLevel = user ? getLevelFromXP(Number(user.xp)) : 1;
  const accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.score / stats.totalQuestions) * 100)
      : 0;

  const isPerfect = stats.score === stats.totalQuestions;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${gradientClass} relative overflow-hidden flex flex-col`}
    >
      {/* Ambient particle-like background dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          "p0",
          "p1",
          "p2",
          "p3",
          "p4",
          "p5",
          "p6",
          "p7",
          "p8",
          "p9",
          "p10",
          "p11",
          "p12",
          "p13",
          "p14",
          "p15",
          "p16",
          "p17",
          "p18",
          "p19",
        ].map((pid, i) => (
          <motion.div
            key={pid}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/10"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Number.POSITIVE_INFINITY,
              delay: (i * 0.23) % 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center px-4 pt-10 pb-24 max-w-md mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ── Hero Celebration ── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center text-center mb-8"
        >
          <motion.div
            className="text-8xl mb-4 drop-shadow-2xl"
            animate={{
              rotate: [0, -8, 8, -4, 4, 0],
              scale: [1, 1.08, 0.97, 1.04, 1],
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {worldEmoji}
          </motion.div>

          {isPerfect && (
            <motion.div
              className="text-3xl mb-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.5, repeat: 3 }}
            >
              🌟
            </motion.div>
          )}

          <h1 className="font-heading text-4xl font-black text-white drop-shadow-lg leading-tight">
            World Complete!
          </h1>
          <p className="font-heading text-xl text-white/80 mt-1">
            {stats.worldName}
          </p>

          {isPerfect && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
              className="mt-3 px-4 py-1.5 bg-yellow-400/20 border border-yellow-400/50 rounded-full text-yellow-300 text-sm font-bold font-heading"
            >
              ✨ Perfect Score!
            </motion.span>
          )}
        </motion.div>

        {/* ── XP & Score Stats Row ── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 w-full mb-4"
        >
          {/* XP Card */}
          <motion.div
            data-ocid="results.xp.card"
            className="bg-black/30 backdrop-blur-sm border border-yellow-400/40 rounded-2xl p-4 flex flex-col items-center"
            variants={glowVariants}
            initial="idle"
            animate="pulse"
          >
            <span className="text-yellow-300 text-3xl font-black font-heading leading-none">
              +{stats.totalXPEarned}
            </span>
            <span className="text-yellow-200/70 text-xs font-semibold mt-1 uppercase tracking-wider">
              XP Earned
            </span>
          </motion.div>

          {/* Score Card */}
          <div
            data-ocid="results.score.card"
            className="bg-black/30 backdrop-blur-sm border border-emerald-400/40 rounded-2xl p-4 flex flex-col items-center"
          >
            <span className="text-emerald-300 text-3xl font-black font-heading leading-none">
              {stats.score}/{stats.totalQuestions}
            </span>
            <span className="text-emerald-200/70 text-xs font-semibold mt-1 uppercase tracking-wider">
              {accuracy}% Correct
            </span>
          </div>
        </motion.div>

        {/* Coins row */}
        {stats.coinsEarned > 0 && (
          <motion.div variants={itemVariants} className="w-full mb-4">
            <div className="bg-black/20 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2">
              <span className="text-xl">🪙</span>
              <span className="text-amber-300 font-bold font-heading">
                +{stats.coinsEarned} Coins Earned
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Level Badge ── */}
        <motion.div variants={itemVariants} className="w-full mb-4">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600 border-4 border-yellow-300/50 flex items-center justify-center text-navy-dark font-black text-xl font-heading shadow-lg flex-shrink-0"
              animate={{
                boxShadow: [
                  "0 0 12px 2px rgba(250,204,21,0.4)",
                  "0 0 24px 6px rgba(250,204,21,0.65)",
                  "0 0 12px 2px rgba(250,204,21,0.4)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              {currentLevel}
            </motion.div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">
                Current Level
              </p>
              <p className="text-white font-heading font-bold text-lg leading-tight">
                Level {currentLevel}
              </p>
              {user && (
                <p className="text-white/60 text-xs mt-0.5">
                  {Number(user.xp).toLocaleString()} total XP
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Next World Panel ── */}
        <AnimatePresence>
          {nextWorld ? (
            <motion.div
              key="next-world-panel"
              data-ocid="results.next_world.panel"
              variants={itemVariants}
              className="w-full mb-6"
            >
              {nextWorld.isUnlocked ? (
                /* Unlocked banner */
                <motion.div
                  className="relative rounded-2xl overflow-hidden border-2 border-yellow-400/60 bg-black/30 backdrop-blur-sm p-5"
                  variants={unlockBorderVariants}
                  initial="idle"
                  animate="pulse"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="text-4xl">
                      {WORLD_THEMES[nextWorld.id]?.emoji ||
                        WORLD_EMOJI_FALLBACK[nextWorld.id] ||
                        "🌍"}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-yellow-300 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                          🔓 Unlocked!
                        </span>
                      </div>
                      <p className="text-white font-heading font-bold text-lg mt-0.5 leading-tight">
                        {nextWorld.name}
                      </p>
                      <p className="text-white/60 text-xs mt-0.5 line-clamp-2">
                        {nextWorld.description}
                      </p>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="text-yellow-300 text-2xl flex-shrink-0"
                    >
                      ⚔️
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                /* Locked banner */
                <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm p-4 flex items-center gap-3">
                  <span className="text-3xl opacity-60">🔒</span>
                  <div>
                    <p className="text-white/80 font-heading font-semibold text-sm">
                      Next: {nextWorld.name}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Keep earning XP to unlock! Need{" "}
                      <span className="text-yellow-300 font-bold">
                        {Number(nextWorld.unlockXp)} XP
                      </span>{" "}
                      to enter.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── CTA Buttons ── */}
        <motion.div variants={itemVariants} className="w-full space-y-3">
          {nextWorld?.isUnlocked && (
            <RPGButton
              data-ocid="results.next_world.primary_button"
              variant="gold"
              size="lg"
              className="w-full"
              onClick={() => onNextWorld(nextWorld.id)}
            >
              Enter Next World ⚔️
            </RPGButton>
          )}

          <RPGButton
            data-ocid="results.replay.button"
            variant="emerald"
            size="lg"
            className="w-full"
            onClick={onReplay}
          >
            Replay World 🔄
          </RPGButton>

          <RPGButton
            data-ocid="results.map.button"
            variant="navy"
            size="lg"
            className="w-full"
            onClick={onBackToMap}
          >
            Back to Map 🗺️
          </RPGButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
