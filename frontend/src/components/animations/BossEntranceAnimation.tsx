import React, { useEffect, useState } from 'react';

interface BossEntranceAnimationProps {
  onComplete?: () => void;
}

export default function BossEntranceAnimation({ onComplete }: BossEntranceAnimationProps) {
  const [phase, setPhase] = useState<'darkening' | 'banner' | 'done'>('darkening');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('banner'), 500);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
      style={{
        background: phase === 'banner'
          ? 'rgba(0,0,0,0.92)'
          : 'rgba(0,0,0,0)',
        transition: 'background 0.5s ease',
      }}>
      {phase === 'banner' && (
        <div className="flex flex-col items-center gap-6 animate-boss-slide">
          <img
            src="/assets/generated/boss-banner.dim_800x300.png"
            alt="Boss Battle"
            className="w-full max-w-lg rounded-2xl"
            style={{ boxShadow: '0 0 60px oklch(0.58 0.22 27 / 0.8)' }}
          />
          <div className="font-heading text-5xl font-bold animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.8))',
            }}>
            ⚔️ BOSS BATTLE! ⚔️
          </div>
          <p className="text-muted-foreground text-sm">Defeat the boss to unlock the next world!</p>
        </div>
      )}
    </div>
  );
}
