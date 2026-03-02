import React from 'react';
import { useGetUser } from '@/hooks/useQueries';

interface CoinGemHeaderProps {
  userId: string | null;
}

export default function CoinGemHeader({ userId }: CoinGemHeaderProps) {
  const { data: user } = useGetUser(userId);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{
          background: 'linear-gradient(135deg, oklch(0.22 0.06 265), oklch(0.18 0.04 265))',
          border: '1px solid oklch(0.78 0.16 85 / 0.4)',
          boxShadow: '0 0 10px oklch(0.78 0.16 85 / 0.2)',
        }}>
        <img src="/assets/generated/icon-coin.dim_64x64.png" alt="coins" className="w-5 h-5" />
        <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.88 0.14 85)' }}>
          {user ? Number(user.coins).toLocaleString() : '—'}
        </span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{
          background: 'linear-gradient(135deg, oklch(0.22 0.06 265), oklch(0.18 0.04 265))',
          border: '1px solid oklch(0.55 0.2 265 / 0.4)',
          boxShadow: '0 0 10px oklch(0.55 0.2 265 / 0.2)',
        }}>
        <img src="/assets/generated/icon-gem.dim_64x64.png" alt="gems" className="w-5 h-5" />
        <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.75 0.18 265)' }}>
          {user ? Number(user.gems).toLocaleString() : '—'}
        </span>
      </div>
    </div>
  );
}
