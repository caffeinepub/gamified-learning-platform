import React, { useEffect } from "react";

interface CoinGemAnimationProps {
  coins?: number;
  gems?: number;
  onComplete?: () => void;
}

export default function CoinGemAnimation({
  coins,
  gems,
  onComplete,
}: CoinGemAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center pb-32">
      <div className="flex gap-3 animate-fade-in-up">
        {coins && coins > 0 && (
          <div className="flex items-center gap-2 bg-amber-900/90 border-2 border-gold rounded-full px-4 py-2 animate-bounce">
            <img
              src="/assets/generated/icon-coin.dim_64x64.png"
              alt="coin"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).textContent = "🪙";
              }}
            />
            <span className="text-gold font-heading font-bold text-lg">
              +{coins}
            </span>
          </div>
        )}
        {gems && gems > 0 && (
          <div className="flex items-center gap-2 bg-purple-900/90 border-2 border-purple-400 rounded-full px-4 py-2 animate-bounce">
            <img
              src="/assets/generated/icon-gem.dim_64x64.png"
              alt="gem"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).textContent = "💎";
              }}
            />
            <span className="text-purple-300 font-heading font-bold text-lg">
              +{gems}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
