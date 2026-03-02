import React from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import BottomNavigation from './BottomNavigation';
import CoinGemHeader from './CoinGemHeader';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { loadUserId } from '@/lib/userStore';
import { useNavigate } from '@tanstack/react-router';
import { Zap } from 'lucide-react';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = loadUserId();
  const isAuthenticated = !!identity;

  // Don't show nav on login/onboarding
  const hideNav = !isAuthenticated || location.pathname === '/onboarding' || location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'oklch(0.13 0.025 265)' }}>
      {/* Header */}
      {!hideNav && (
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
          style={{
            background: 'linear-gradient(180deg, oklch(0.16 0.04 265 / 0.98) 0%, oklch(0.13 0.025 265 / 0.95) 100%)',
            borderBottom: '1px solid oklch(0.3 0.05 265)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => navigate({ to: '/world-map' })}
            className="flex items-center gap-2 font-heading text-xl font-bold"
            style={{ color: 'oklch(0.88 0.14 85)' }}
          >
            <Zap size={22} style={{ color: 'oklch(0.78 0.16 85)' }} />
            EduQuest
          </button>
          <CoinGemHeader userId={userId} />
        </header>
      )}

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: hideNav ? '0' : '80px' }}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!hideNav && <BottomNavigation />}
    </div>
  );
}
