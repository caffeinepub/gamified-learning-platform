import {
  ArrowLeft,
  CheckCircle,
  Coins,
  Shield,
  Star,
  Swords,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import RPGButton from "../components/RPGButton";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  WORLD_NAME_TO_ID,
  useGetAvailableWorlds,
  useGetWorldLessons,
  useGetWorldProgress,
} from "../hooks/useQueries";
import {
  DIFFICULTY_LABELS,
  SUBJECT_LABELS,
  WORLD_THEMES,
} from "../lib/gameData";

interface WorldDetailPageProps {
  worldId: string;
  userId: string;
  onBack: () => void;
  onSelectLesson: (worldId: string, lessonIndex: number) => void;
}

const WORLD_ID_TO_NAME: Record<string, string> = {
  world1: "Alphabet Forest",
  world2: "Grammar City",
  world3: "Math Valley",
  world4: "Algebra Mountains",
  world5: "Master Volcano",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  elementary: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30",
  mastery: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const SUBJECT_COLORS: Record<string, string> = {
  math: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  english: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function WorldDetailPage({
  worldId,
  userId,
  onBack,
  onSelectLesson,
}: WorldDetailPageProps) {
  // Resolve worldId → worldName
  const resolvedWorldId = WORLD_NAME_TO_ID[worldId] || worldId;
  const worldName = WORLD_ID_TO_NAME[resolvedWorldId] || resolvedWorldId;

  const theme = WORLD_THEMES[resolvedWorldId] ?? {
    color: "#f59e0b",
    emoji: "🌍",
    bgClass: "from-gray-900 to-gray-700",
  };

  const { data: lessons, isLoading: lessonsLoading } =
    useGetWorldLessons(resolvedWorldId);
  const { data: progressRecords } = useGetWorldProgress(userId, worldName);
  const { data: worlds } = useGetAvailableWorlds(userId);

  // Find the world object for the hero banner
  const worldObj = worlds?.find(
    (w) => w.id === resolvedWorldId || w.name === worldName,
  );

  // Build a set of completed lesson names
  const completedLessonNames = new Set(
    progressRecords?.filter((r) => r.completed).map((r) => r.lessonName) ?? [],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          data-ocid="worlddetail.back.button"
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/50 transition-all"
          aria-label="Back to world map"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="font-heading text-lg font-bold text-foreground truncate">
          {worldName}
        </span>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${theme.bgClass} px-5 pt-8 pb-10`}
      >
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${theme.color}66, transparent)`,
          }}
        />

        <div className="relative text-center">
          {/* World emoji */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-7xl mb-3 drop-shadow-xl"
            aria-hidden="true"
          >
            {theme.emoji}
          </motion.div>

          {/* World name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-heading text-2xl font-bold text-white mb-1"
          >
            {worldName}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4 }}
            className="text-white/70 text-sm mb-4 max-w-xs mx-auto leading-relaxed"
          >
            {worldObj?.description ??
              "Explore this world and master its lessons!"}
          </motion.p>

          {/* Badges row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {worldObj?.subject !== undefined && (
              <span
                className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${
                  SUBJECT_COLORS[String(worldObj.subject)] ??
                  "bg-card/40 text-white/80 border-white/20"
                }`}
              >
                {SUBJECT_LABELS[String(worldObj.subject)] ??
                  String(worldObj.subject)}
              </span>
            )}
            {worldObj?.difficulty !== undefined && (
              <span
                className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${
                  DIFFICULTY_COLORS[String(worldObj.difficulty)] ??
                  "bg-card/40 text-white/80 border-white/20"
                }`}
              >
                {DIFFICULTY_LABELS[String(worldObj.difficulty)] ??
                  String(worldObj.difficulty)}
              </span>
            )}
            {worldObj?.unlockXp !== undefined && (
              <span className="text-xs border border-gold/40 bg-gold/10 text-gold rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1">
                <Zap size={10} />
                {Number(worldObj.unlockXp)} XP to unlock
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Lessons Section ── */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Lessons
          </h2>
          {lessons && lessons.length > 0 && (
            <span className="text-xs text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1">
              {completedLessonNames.size} / {lessons.length} completed
            </span>
          )}
        </div>

        {/* Loading state */}
        {lessonsLoading && (
          <div
            className="space-y-3"
            data-ocid="worlddetail.lessons.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4"
              >
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!lessonsLoading && (!lessons || lessons.length === 0) && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="worlddetail.lessons.empty_state"
          >
            <div className="text-5xl mb-4" aria-hidden="true">
              📚
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
              No Lessons Yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              No lessons in this world yet. Check back soon!
            </p>
          </div>
        )}

        {/* Lessons list */}
        {!lessonsLoading && lessons && lessons.length > 0 && (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessonNames.has(lesson.title);
              const difficultyKey = String(lesson.difficulty);
              const ocid = `worlddetail.lesson.item.${index + 1}`;

              return (
                <motion.button
                  key={lesson.id}
                  type="button"
                  data-ocid={ocid}
                  variants={itemVariants}
                  onClick={() => onSelectLesson(resolvedWorldId, index)}
                  className={`w-full text-left flex items-center gap-4 rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer group
                    ${
                      isCompleted
                        ? "bg-emerald-900/20 border-emerald-700/40 hover:border-emerald-600/60"
                        : "bg-card border-border hover:border-gold/40 hover:bg-gold/5"
                    }`}
                >
                  {/* Lesson number */}
                  <div
                    className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-heading font-bold text-sm border-2
                      ${
                        isCompleted
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-muted border-border text-muted-foreground group-hover:border-gold/40 group-hover:text-gold transition-colors"
                      }`}
                    aria-hidden="true"
                  >
                    {isCompleted ? (
                      <CheckCircle size={16} className="text-emerald-400" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-heading font-semibold text-foreground text-sm truncate">
                        {lesson.title}
                      </span>
                      {lesson.isBossBattle && (
                        <span className="flex-shrink-0 text-xs border border-red-600/40 bg-red-900/30 text-red-400 rounded-full px-1.5 py-0.5 flex items-center gap-1">
                          <Swords size={9} />
                          Boss
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* XP badge */}
                      <span className="text-xs border border-gold/30 bg-gold/10 text-gold rounded-full px-1.5 py-0.5 flex items-center gap-1">
                        <Star size={9} />+{Number(lesson.xpReward)} XP
                      </span>
                      {/* Coin badge */}
                      {Number(lesson.coinReward) > 0 && (
                        <span className="text-xs border border-amber-600/30 bg-amber-900/20 text-amber-400 rounded-full px-1.5 py-0.5 flex items-center gap-1">
                          <Coins size={9} />+{Number(lesson.coinReward)}
                        </span>
                      )}
                      {/* Difficulty badge */}
                      <span
                        className={`text-xs border rounded-full px-1.5 py-0.5 flex items-center gap-1 ${
                          DIFFICULTY_COLORS[difficultyKey] ??
                          "border-border text-muted-foreground"
                        }`}
                      >
                        <Shield size={9} />
                        {DIFFICULTY_LABELS[difficultyKey] ?? difficultyKey}
                      </span>
                      {/* Completed badge */}
                      {isCompleted && (
                        <span className="text-xs border border-emerald-600/40 bg-emerald-900/30 text-emerald-400 rounded-full px-1.5 py-0.5">
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow chevron */}
                  <span
                    className="text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0 text-lg"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Start from Beginning CTA ── */}
      {!lessonsLoading && lessons && lessons.length > 0 && (
        <motion.div
          className="px-4 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <RPGButton
            variant="gold"
            size="lg"
            className="w-full"
            data-ocid="worlddetail.start.primary_button"
            onClick={() => onSelectLesson(resolvedWorldId, 0)}
          >
            ⚔️ Start from Beginning
          </RPGButton>
        </motion.div>
      )}

      {/* ── Footer ── */}
      <div className="px-4 pt-8 pb-2 text-center text-xs text-muted-foreground/50">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
