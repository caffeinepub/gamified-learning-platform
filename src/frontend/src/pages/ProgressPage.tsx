import { BookOpen, Globe, ScrollText, Star, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useMemo } from "react";
import type { LessonProgressRecord } from "../backend";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useGetUserProgress } from "../hooks/useQueries";
import { loadUserId } from "../lib/userStore";

interface ProgressPageProps {
  userId: string;
}

/**
 * Convert a nanosecond bigint timestamp to a human-readable date string.
 * e.g. "Mar 7, 2026"
 */
function formatNanoTimestamp(nanos: bigint): string {
  if (!nanos || nanos === BigInt(0)) return "—";
  try {
    const ms = Number(nanos / BigInt(1_000_000));
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function ScoreBadge({ score }: { score: bigint }) {
  const s = Number(score);
  if (s >= 100) {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold px-2">
        ✦ {s}
      </Badge>
    );
  }
  if (s >= 50) {
    return (
      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold px-2">
        ◈ {s}
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/20 text-red-400 border border-red-500/50 font-bold px-2">
      ✕ {s}
    </Badge>
  );
}

/** World emoji lookup by name */
const WORLD_EMOJI: Record<string, string> = {
  "Alphabet Forest": "🌲",
  "Grammar City": "🏙️",
  "Math Valley": "⛰️",
  "Algebra Mountains": "🏔️",
  "Master Volcano": "🌋",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ProgressPage({
  userId: propUserId,
}: ProgressPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: progress, isLoading } = useGetUserProgress(userId);

  // Deduplicate: keep best score per lesson name
  const allRecords: LessonProgressRecord[] = progress ?? [];

  const summary = useMemo(() => {
    const completed = allRecords.filter((r) => r.completed);
    const totalXP = completed.reduce((sum, r) => sum + Number(r.xpEarned), 0);
    const worldSet = new Set(allRecords.map((r) => r.worldName));
    const currentWorld =
      allRecords.length > 0
        ? allRecords[allRecords.length - 1].worldName
        : "Alphabet Forest";
    return {
      completedCount: completed.length,
      totalXP,
      worldCount: worldSet.size,
      currentWorld,
    };
  }, [allRecords]);

  // Sort by dateCompleted descending (most recent first)
  const sortedRecords = useMemo(
    () =>
      [...allRecords].sort(
        (a, b) => Number(b.dateCompleted) - Number(a.dateCompleted),
      ),
    [allRecords],
  );

  const OCID_ITEMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  return (
    <div
      className="min-h-screen bg-background px-4 py-6 flex flex-col gap-5"
      data-ocid="progress.page"
    >
      {/* Page header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ScrollText size={22} className="text-gold" />
          <h1 className="font-heading text-3xl font-bold text-gold">
            Adventure Log
          </h1>
          <ScrollText size={22} className="text-gold" />
        </div>
        <p className="text-muted-foreground text-sm">
          Your journey through the realms of knowledge
        </p>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          data-ocid="progress.section"
        >
          {/* Lessons completed */}
          <motion.div
            variants={rowVariants}
            className="bg-card border border-gold/25 rounded-2xl p-4 flex flex-col items-center gap-1"
            style={{ boxShadow: "0 0 18px oklch(0.78 0.16 85 / 0.1)" }}
            data-ocid="progress.card"
          >
            <Trophy size={20} className="text-gold" />
            <p className="font-heading font-bold text-2xl text-gold">
              {summary.completedCount}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Lessons Completed
            </p>
          </motion.div>

          {/* Total XP */}
          <motion.div
            variants={rowVariants}
            className="bg-card border border-emerald-500/25 rounded-2xl p-4 flex flex-col items-center gap-1"
            style={{ boxShadow: "0 0 18px oklch(0.55 0.18 155 / 0.1)" }}
            data-ocid="progress.card"
          >
            <Zap size={20} className="text-emerald-400" />
            <p className="font-heading font-bold text-2xl text-emerald-400">
              {summary.totalXP}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              XP Earned
            </p>
          </motion.div>

          {/* Worlds explored */}
          <motion.div
            variants={rowVariants}
            className="bg-card border border-blue-500/25 rounded-2xl p-4 flex flex-col items-center gap-1"
            style={{ boxShadow: "0 0 18px oklch(0.55 0.2 265 / 0.1)" }}
            data-ocid="progress.card"
          >
            <Globe size={20} className="text-blue-400" />
            <p className="font-heading font-bold text-2xl text-blue-400">
              {summary.worldCount}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Worlds Explored
            </p>
          </motion.div>

          {/* Current world */}
          <motion.div
            variants={rowVariants}
            className="bg-card border border-purple-500/25 rounded-2xl p-4 flex flex-col items-center gap-1"
            style={{ boxShadow: "0 0 18px oklch(0.45 0.2 295 / 0.1)" }}
            data-ocid="progress.card"
          >
            <Star size={20} className="text-purple-400" />
            <p className="font-heading font-bold text-base text-purple-400 text-center leading-tight">
              {WORLD_EMOJI[summary.currentWorld] || "🌍"} {summary.currentWorld}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Current World
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Progress history table */}
      <div className="max-w-sm mx-auto w-full" data-ocid="progress.section">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-gold" />
          <h2 className="font-heading font-bold text-lg text-foreground">
            Quest Journal
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-2" data-ocid="progress.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : sortedRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-3 bg-card border border-border/40 rounded-2xl"
            data-ocid="progress.empty_state"
          >
            <div
              className="text-5xl"
              style={{
                filter: "drop-shadow(0 0 12px oklch(0.78 0.16 85 / 0.4))",
              }}
            >
              📜
            </div>
            <p className="font-heading text-lg text-gold">
              No quests recorded yet
            </p>
            <p className="text-muted-foreground text-sm text-center max-w-[200px]">
              Complete your first lesson to write your legend here!
            </p>
          </motion.div>
        ) : (
          <div
            className="bg-card border border-gold/20 rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)" }}
            data-ocid="progress.table"
          >
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gold/20 hover:bg-transparent">
                    <TableHead className="text-gold font-heading text-xs py-3 pl-4">
                      Lesson
                    </TableHead>
                    <TableHead className="text-gold font-heading text-xs py-3">
                      World
                    </TableHead>
                    <TableHead className="text-gold font-heading text-xs py-3 text-center">
                      Score
                    </TableHead>
                    <TableHead className="text-gold font-heading text-xs py-3 text-center">
                      XP
                    </TableHead>
                    <TableHead className="text-gold font-heading text-xs py-3 pr-4 text-right hidden sm:table-cell">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedRecords.map((record, index) => {
                      const ocidIndex = OCID_ITEMS[index] ?? String(index + 1);
                      const worldEmoji = WORLD_EMOJI[record.worldName] || "🌍";
                      const dateStr = formatNanoTimestamp(record.dateCompleted);
                      return (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.25 }}
                          className="border-b border-border/20 hover:bg-gold/5 transition-colors"
                          data-ocid={`progress.item.${ocidIndex}`}
                        >
                          <TableCell className="py-3 pl-4">
                            <p className="text-foreground text-xs font-semibold leading-tight truncate max-w-[90px]">
                              {record.lessonName}
                            </p>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {worldEmoji} {record.worldName}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <ScoreBadge score={record.score} />
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <span className="text-xs font-bold text-emerald-400">
                              +{Number(record.xpEarned)}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 pr-4 text-right hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">
                              {dateStr}
                            </span>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center pt-2 pb-4 max-w-sm mx-auto w-full">
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
