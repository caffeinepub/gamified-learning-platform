import React from "react";
import RPGButton from "../components/RPGButton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onLogin?: () => void;
}

export default function LoginPage({ onLogin: _onLogin }: LoginPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">
          ⚔️
        </div>
        <div
          className="absolute top-32 right-8 text-5xl opacity-10 animate-float"
          style={{ animationDelay: "1s" }}
        >
          🏰
        </div>
        <div
          className="absolute bottom-40 left-6 text-5xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        >
          🐉
        </div>
        <div
          className="absolute bottom-20 right-12 text-4xl opacity-10 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          ✨
        </div>
        <div
          className="absolute top-1/2 left-4 text-3xl opacity-10 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          🗺️
        </div>
      </div>

      <div className="w-full max-w-sm text-center relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-7xl mb-4 animate-bounce-slow">⚔️</div>
          <h1 className="font-heading text-5xl font-bold text-gold mb-2 tracking-wide">
            EduQuest
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn. Battle. Conquer.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: "🗺️", text: "Epic Worlds" },
            { icon: "⚡", text: "Skill Trees" },
            { icon: "🏆", text: "Leaderboards" },
            { icon: "🤖", text: "AI Tutor" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="bg-card border border-gold/20 rounded-xl p-3 flex items-center gap-2"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium text-foreground">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <RPGButton
          variant="gold"
          size="lg"
          loading={isLoggingIn}
          onClick={handleLogin}
          className="w-full"
        >
          {isLoggingIn ? "Connecting..." : "⚔️ Begin Your Quest"}
        </RPGButton>

        <p className="text-muted-foreground text-xs mt-4">
          Secure login powered by Internet Identity
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} EduQuest. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
