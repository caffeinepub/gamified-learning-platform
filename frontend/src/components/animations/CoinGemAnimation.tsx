import React, { useEffect, useState } from 'react';

interface CoinGemAnimationProps {
  coins?: number;
  gems?: number;
  onComplete?: () => void;
}

export default function CoinGemAnimation({ coins, gems, onComplete }: CoinGemAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center pb-32">
      <div className="flex gap-3">
        {coins && coins > 0 && (
          <div className="animate-coin-bounce flex items-center gap-2 rounded-full px-4 py-2 font-heading font-bold text-xl"
            style={{
              background: 'linear-gradient(135deg, oklch(0.78 0.16 85), oklch(0.62 0.16 75))',
              boxShadow: '0 0 20px oklch(0.78 0.16 85 / 0.6)',
              color: 'oklch(0.13 0.025 265)',
            }}>
            <img src="/assets/generated/icon-coin.dim_64x64.png" alt="coin" className="w-6 h-6" />
            +{coins}
          </div>
        )}
        {gems && gems > 0 && (
          <div className="animate-coin-bounce flex items-center gap-2 rounded-full px-4 py-2 font-heading font-bold text-xl"
            style={{
              background: 'linear-gradient(135deg, oklch(0.55 0.2 265), oklch(0.45 0.2 295))',
              boxShadow: '0 0 20px oklch(0.55 0.2 265 / 0.6)',
              color: 'white',
              animationDelay: '0.1s',
            }}>
            <img src="/assets/generated/icon-gem.dim_64x64.png" alt="gem" className="w-6 h-6" />
            +{gems}
          </div>
        )}
      </div>
    </div>
  );
}
