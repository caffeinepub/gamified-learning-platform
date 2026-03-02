import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Map, TreePine, Star, Flame, Swords, Bot, User, Trophy, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/world-map', icon: Map, label: 'Map' },
  { path: '/skill-tree', icon: TreePine, label: 'Skills' },
  { path: '/daily-quests', icon: Star, label: 'Quests' },
  { path: '/streak', icon: Flame, label: 'Streak' },
  { path: '/multiplayer', icon: Swords, label: 'Battle' },
  { path: '/ai-tutor', icon: Bot, label: 'Tutor' },
  { path: '/shop', icon: ShoppingBag, label: 'Shop' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-1 py-1">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className={cn('nav-item', isActive && 'active')}
            >
              <Icon
                size={isActive ? 22 : 20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={
                  isActive
                    ? { filter: 'drop-shadow(0 0 6px oklch(0.78 0.16 85 / 0.8))' }
                    : {}
                }
              />
              <span
                className={cn(
                  'text-[9px] font-body font-bold leading-none',
                  isActive ? '' : 'text-muted-foreground'
                )}
                style={isActive ? { color: 'oklch(0.78 0.16 85)' } : {}}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
