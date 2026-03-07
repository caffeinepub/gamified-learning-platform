import React, { useEffect } from "react";

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
}

export default function LevelUpAnimation({
  newLevel,
  onComplete,
}: LevelUpAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <button
      type="button"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm w-full"
      onClick={onComplete}
    >
      <div className="text-center animate-scale-in">
        <div className="text-6xl mb-4">🎉</div>
        <div className="bg-gradient-to-b from-gold to-gold-dark text-navy-dark font-heading font-bold text-3xl px-10 py-6 rounded-3xl border-4 border-gold-dark shadow-2xl">
          <div className="text-lg mb-1">LEVEL UP!</div>
          <div className="text-5xl">Level {newLevel}</div>
          <div className="text-sm mt-2 opacity-80">Tap to continue</div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {(
            [
              "star-1-⭐",
              "sparkles-✨",
              "glowing-🌟",
              "dizzy-💫",
              "star-2-⭐",
            ] as const
          ).map((key, i) => (
            <span
              key={key}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {key.split("-").pop()}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
