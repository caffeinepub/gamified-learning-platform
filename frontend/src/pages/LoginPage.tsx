import React from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import RPGButton from '@/components/RPGButton';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'oklch(0.13 0.025 265)' }}>
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-8xl animate-bounce">🏰</div>
          <h1
            className="font-heading text-5xl font-bold"
            style={{
              background: 'linear-gradient(135deg, oklch(0.88 0.14 85), oklch(0.78 0.16 85))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EduQuest
          </h1>
          <p className="font-heading text-2xl" style={{ color: 'oklch(0.65 0.15 220)' }}>
            Academy
          </p>
        </div>

        {/* Tagline */}
        <div
          className="rpg-card w-full"
          style={{
            background: 'linear-gradient(135deg, oklch(0.2 0.04 265), oklch(0.16 0.03 265))',
            border: '2px solid oklch(0.78 0.16 85 / 0.3)',
          }}
        >
          <p className="font-body text-base leading-relaxed text-foreground/90">
            ⚔️ Master Math & English through epic quests, defeat bosses, and become the ultimate Scholar Hero!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { emoji: '🗺️', label: '12 Worlds' },
            { emoji: '⚡', label: 'Earn XP' },
            { emoji: '🏆', label: 'Leaderboards' },
            { emoji: '🤖', label: 'AI Tutor' },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: 'oklch(0.18 0.04 265)',
                border: '1px solid oklch(0.3 0.05 265)',
              }}
            >
              <span className="text-xl">{emoji}</span>
              <span className="font-body font-semibold text-sm text-foreground/80">{label}</span>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <RPGButton
          variant="gold"
          size="lg"
          onClick={login}
          loading={isLoggingIn}
          className="w-full"
        >
          🚀 Login to Play!
        </RPGButton>

        <p className="text-muted-foreground text-xs font-body">
          Secure login powered by Internet Identity
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-muted-foreground text-xs font-body">
          © {new Date().getFullYear()} Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'eduquest-academy')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
