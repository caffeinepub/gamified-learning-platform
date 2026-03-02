import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListWorlds } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { useGetUser } from '@/hooks/useQueries';
import { WORLD_THEMES, DIFFICULTY_LABELS, SUBJECT_LABELS } from '@/lib/gameData';
import { Lock, Star, Sword, BookOpen } from 'lucide-react';
import { type World, Subject } from '@/backend';
import { cn } from '@/lib/utils';
import RPGButton from '@/components/RPGButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

function WorldNode({ world, userLevel, onClick }: { world: World; userLevel: number; onClick: () => void }) {
  const theme = WORLD_THEMES[world.name] || { emoji: '🌍', color: '#888', bgGradient: 'from-gray-800 to-gray-700', zone: 'unknown' };
  const isLocked = Number(world.requiredLevel) > userLevel;
  const isBossDefeated = world.bossDefeated;

  return (
    <div className="world-node" onClick={!isLocked ? onClick : undefined}>
      <div
        className={cn(
          'world-node-circle',
          isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110',
          isBossDefeated && 'animate-pulse-glow'
        )}
        style={{
          background: isLocked
            ? 'linear-gradient(135deg, oklch(0.22 0.04 265), oklch(0.18 0.03 265))'
            : `linear-gradient(135deg, ${theme.color}88, ${theme.color}44)`,
          borderColor: isLocked ? 'oklch(0.35 0.05 265)' : theme.color,
          boxShadow: isLocked ? 'none' : `0 0 15px ${theme.color}44`,
        }}>
        {isLocked ? <Lock size={24} className="text-muted-foreground" /> : (
          <span className="text-2xl">{theme.emoji}</span>
        )}
      </div>
      <div className="mt-2 text-center max-w-[80px]">
        <p className={cn(
          'font-heading text-xs font-bold leading-tight',
          isLocked ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {world.name}
        </p>
        {isLocked && (
          <p className="text-[10px] text-muted-foreground font-body">Lv.{Number(world.requiredLevel)}</p>
        )}
        {isBossDefeated && !isLocked && (
          <p className="text-[10px] font-body" style={{ color: 'oklch(0.78 0.16 85)' }}>✓ Cleared</p>
        )}
      </div>
    </div>
  );
}

export default function WorldMapPage() {
  const navigate = useNavigate();
  const userId = loadUserId();
  const { data: worlds = [], isLoading } = useListWorlds();
  const { data: user } = useGetUser(userId);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

  const userLevel = user ? Number(user.level) : 1;

  const mathWorlds = worlds.filter(w => w.subject === Subject.math);
  const englishWorlds = worlds.filter(w => w.subject === Subject.english);

  const handleWorldClick = (world: World) => {
    setSelectedWorld(world);
  };

  const handleEnterWorld = () => {
    if (selectedWorld) {
      navigate({ to: '/lesson/$worldId', params: { worldId: selectedWorld.id } });
      setSelectedWorld(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/world-map-bg.dim_1200x800.png"
          alt="World Map"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, oklch(0.13 0.025 265 / 0.3) 0%, oklch(0.13 0.025 265 / 0.7) 100%)'
        }} />
      </div>

      <div className="relative z-10 px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
            🗺️ World Map
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            Level {userLevel} Explorer • Choose your realm
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-gold-DEFAULT border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-body">Loading worlds...</p>
          </div>
        ) : worlds.length === 0 ? (
          <div className="rpg-card rpg-card-gold text-center py-8">
            <p className="font-heading text-xl mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>No Worlds Yet!</p>
            <p className="text-muted-foreground font-body text-sm">The admin needs to create worlds first.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Math Worlds */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1" style={{ background: 'oklch(0.35 0.06 265)' }} />
                <span className="font-heading text-lg font-bold px-3" style={{ color: 'oklch(0.62 0.2 155)' }}>
                  🔢 Math Realms
                </span>
                <div className="h-px flex-1" style={{ background: 'oklch(0.35 0.06 265)' }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {mathWorlds.map((world) => (
                  <WorldNode
                    key={world.id}
                    world={world}
                    userLevel={userLevel}
                    onClick={() => handleWorldClick(world)}
                  />
                ))}
              </div>
            </div>

            {/* English Worlds */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1" style={{ background: 'oklch(0.35 0.06 265)' }} />
                <span className="font-heading text-lg font-bold px-3" style={{ color: 'oklch(0.65 0.15 220)' }}>
                  📚 English Realms
                </span>
                <div className="h-px flex-1" style={{ background: 'oklch(0.35 0.06 265)' }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {englishWorlds.map((world) => (
                  <WorldNode
                    key={world.id}
                    world={world}
                    userLevel={userLevel}
                    onClick={() => handleWorldClick(world)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* World Detail Dialog */}
      <Dialog open={!!selectedWorld} onOpenChange={() => setSelectedWorld(null)}>
        <DialogContent className="max-w-sm mx-auto"
          style={{
            background: 'linear-gradient(135deg, oklch(0.2 0.04 265), oklch(0.16 0.03 265))',
            border: '2px solid oklch(0.78 0.16 85 / 0.4)',
          }}>
          {selectedWorld && (() => {
            const theme = WORLD_THEMES[selectedWorld.name] || { emoji: '🌍', color: '#888', bgGradient: 'from-gray-800 to-gray-700', zone: 'unknown' };
            const isLocked = Number(selectedWorld.requiredLevel) > userLevel;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl flex items-center gap-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
                    <span className="text-3xl">{theme.emoji}</span>
                    {selectedWorld.name}
                  </DialogTitle>
                  <DialogDescription className="font-body">
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="font-body text-xs">
                        {SUBJECT_LABELS[selectedWorld.subject]}
                      </Badge>
                      <Badge variant="outline" className="font-body text-xs">
                        {DIFFICULTY_LABELS[selectedWorld.difficulty]}
                      </Badge>
                      <Badge variant="outline" className="font-body text-xs">
                        Req. Level {Number(selectedWorld.requiredLevel)}
                      </Badge>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center gap-3 text-sm font-body">
                    <BookOpen size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">5 lessons + 1 boss battle</span>
                  </div>
                  {selectedWorld.bossDefeated && (
                    <div className="flex items-center gap-2 text-sm font-body" style={{ color: 'oklch(0.78 0.16 85)' }}>
                      <Star size={16} />
                      <span>Boss Defeated! ✓</span>
                    </div>
                  )}
                  {isLocked ? (
                    <div className="rpg-card text-center py-3">
                      <Lock size={24} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-body text-sm">
                        Reach Level {Number(selectedWorld.requiredLevel)} to unlock
                      </p>
                    </div>
                  ) : (
                    <RPGButton variant="gold" size="md" onClick={handleEnterWorld} className="w-full">
                      <Sword size={18} className="mr-2" />
                      Enter World!
                    </RPGButton>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
