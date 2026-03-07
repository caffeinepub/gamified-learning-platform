import React, { useEffect } from "react";

interface BossEntranceAnimationProps {
  bossName?: string;
  onComplete?: () => void;
}

export default function BossEntranceAnimation({
  bossName = "Boss Battle",
  onComplete,
}: BossEntranceAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center animate-scale-in">
        <img
          src="/assets/generated/boss-banner.dim_800x300.png"
          alt="Boss Battle"
          className="w-full max-w-lg mx-auto mb-4 rounded-xl border-4 border-red-500 shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="text-red-400 font-heading font-bold text-4xl animate-pulse">
          ⚔️ {bossName} ⚔️
        </div>
        <div className="text-white/60 text-sm mt-2">Prepare for battle!</div>
      </div>
    </div>
  );
}
