import React, { useEffect, useState } from 'react';

interface XPGainAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export default function XPGainAnimation({ amount, onComplete }: XPGainAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-float-up flex items-center gap-2 rounded-full px-6 py-3 text-2xl font-heading font-bold"
        style={{
          background: 'linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.78 0.16 85))',
          boxShadow: '0 0 30px oklch(0.78 0.16 85 / 0.6)',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}>
        ⚡ +{amount} XP
      </div>
    </div>
  );
}
