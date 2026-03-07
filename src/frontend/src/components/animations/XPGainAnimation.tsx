import React, { useEffect } from "react";

interface XPGainAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export default function XPGainAnimation({
  amount,
  onComplete,
}: XPGainAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-bounce-up text-center">
        <div className="bg-gold/90 text-navy-dark font-heading font-bold text-2xl px-6 py-3 rounded-2xl border-2 border-gold-dark shadow-lg animate-fade-in-up">
          +{amount} XP ⭐
        </div>
      </div>
    </div>
  );
}
