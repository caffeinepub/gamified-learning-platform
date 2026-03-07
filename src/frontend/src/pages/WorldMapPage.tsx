import { BookOpen, ChevronRight, Lock, Star } from "lucide-react";
import React, { useState } from "react";
import type { World } from "../backend";
import RPGButton from "../components/RPGButton";
import { Skeleton } from "../components/ui/skeleton";
import {
  useGetAvailableWorlds,
  useGetUser,
  useGetUserProgress,
} from "../hooks/useQueries";
import {
  DIFFICULTY_LABELS,
  SUBJECT_LABELS,
  WORLD_THEMES,
} from "../lib/gameData";
import { loadUserId } from "../lib/userStore";

interface WorldMapPageProps {
  userId: string;
  onEnterWorld: (worldId: string) => void;
}

export default function WorldMapPage({
  userId: propUserId,
  onEnterWorld,
}: WorldMapPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: worlds, isLoading } = useGetAvailableWorlds(userId);
  const { data: user } = useGetUser(userId);
  const { data: allProgress = [] } = useGetUserProgress(userId);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

  const sortedWorlds = worlds
    ? [...worlds].sort((a, b) => Number(a.order) - Number(b.order))
    : [];

  // Build a map of worldName -> completed lesson count from progress records
  const worldProgressMap = allProgress.reduce<Record<string, number>>(
    (acc, record) => {
      if (record.completed) {
        acc[record.worldName] = (acc[record.worldName] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">World Map</h1>
        {user && (
          <p className="text-muted-foreground text-sm mt-1">
            Level {Number(user.level)} · {Number(user.xp)} XP
          </p>
        )}
      </div>

      {/* World path */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-sm mx-auto">
          {sortedWorlds.map((world, index) => {
            const theme = WORLD_THEMES[world.id] || WORLD_THEMES.world1;
            const isUnlocked = world.isUnlocked;

            const completedInWorld = worldProgressMap[world.name] || 0;

            return (
              <div key={world.id} className="relative">
                {/* Connector line */}
                {index < sortedWorlds.length - 1 && (
                  <div className="absolute left-1/2 -bottom-4 w-0.5 h-4 bg-gold/30 z-0" />
                )}

                <button
                  type="button"
                  onClick={() => setSelectedWorld(world)}
                  data-ocid={`worldmap.item.${index + 1}`}
                  className={`w-full relative z-10 rounded-2xl border-2 p-4 transition-all duration-200 text-left ${
                    isUnlocked
                      ? "border-gold/60 bg-card hover:border-gold hover:scale-[1.02] cursor-pointer"
                      : "border-border/40 bg-card/50 cursor-pointer opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${theme.bgClass} flex-shrink-0`}
                    >
                      {isUnlocked ? (
                        theme.emoji
                      ) : (
                        <Lock size={24} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-foreground truncate">
                          {world.name}
                        </h3>
                        {world.bossDefeated && (
                          <Star size={14} className="text-gold flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {world.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-card border border-border rounded-full px-2 py-0.5">
                          {SUBJECT_LABELS[world.subject] || world.subject}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {DIFFICULTY_LABELS[world.difficulty] ||
                            world.difficulty}
                        </span>
                        {!isUnlocked && (
                          <span className="text-xs text-amber-400">
                            {Number(world.unlockXp)} XP needed
                          </span>
                        )}
                        {isUnlocked && completedInWorld > 0 && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <BookOpen size={11} />
                            {completedInWorld} done
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* World detail dialog */}
      {selectedWorld && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm w-full"
          onClick={() => setSelectedWorld(null)}
        >
          <div
            className="w-full max-w-sm bg-card border-t-2 border-gold/50 rounded-t-3xl p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl bg-gradient-to-br ${
                  WORLD_THEMES[selectedWorld.id]?.bgClass ||
                  "from-gray-800 to-gray-600"
                }`}
              >
                {selectedWorld.isUnlocked
                  ? WORLD_THEMES[selectedWorld.id]?.emoji || "🌍"
                  : "🔒"}
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {selectedWorld.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedWorld.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-background rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground">Subject</div>
                <div className="font-bold text-foreground capitalize">
                  {selectedWorld.subject}
                </div>
              </div>
              <div className="bg-background rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground">Difficulty</div>
                <div className="font-bold text-foreground capitalize">
                  {selectedWorld.difficulty}
                </div>
              </div>
              <div className="bg-background rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground">Required XP</div>
                <div className="font-bold text-gold">
                  {Number(selectedWorld.unlockXp)}
                </div>
              </div>
              <div className="bg-background rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground">Status</div>
                <div
                  className={`font-bold ${selectedWorld.isUnlocked ? "text-emerald-400" : "text-muted-foreground"}`}
                >
                  {selectedWorld.isUnlocked ? "Unlocked" : "Locked"}
                </div>
              </div>
            </div>

            {selectedWorld.isUnlocked ? (
              <RPGButton
                variant="gold"
                size="lg"
                className="w-full"
                data-ocid="worldmap.enter.primary_button"
                onClick={() => {
                  onEnterWorld(selectedWorld.id);
                  setSelectedWorld(null);
                }}
              >
                Enter World ⚔️
              </RPGButton>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-3">
                  Earn {Number(selectedWorld.unlockXp)} XP to unlock this world
                </p>
                <RPGButton
                  variant="navy"
                  size="lg"
                  className="w-full"
                  data-ocid="worldmap.cancel.button"
                  onClick={() => setSelectedWorld(null)}
                >
                  Keep Training
                </RPGButton>
              </div>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
