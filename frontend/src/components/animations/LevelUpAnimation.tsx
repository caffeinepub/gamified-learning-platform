import React, { useEffect, useState } from 'react';

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
}

const CONFETTI_COLORS = ['#fbbf24', '#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#f97316'];

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function LevelUpAnimation({ newLevel, onComplete }: LevelUpAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={() => { setVisible(false); onComplete?.(); }}>
      <Confetti />
      <div className="animate-level-up relative flex flex-col items-center gap-4 text-center">
        <div className="text-8xl animate-bounce">⭐</div>
        <div className="font-heading text-6xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.8))',
          }}>
          LEVEL UP!
        </div>
        <div className="font-heading text-4xl text-white">
          Level <span style={{ color: '#fbbf24' }}>{newLevel}</span>
        </div>
        <p className="text-muted-foreground text-sm mt-2">Tap to continue</p>
      </div>
    </div>
  );
}
