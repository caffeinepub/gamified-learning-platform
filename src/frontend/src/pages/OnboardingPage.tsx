import React, { useState } from "react";
import RPGButton from "../components/RPGButton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateUser, useSaveCallerUserProfile } from "../hooks/useQueries";
import { AVATAR_OPTIONS } from "../lib/gameData";
import { saveUserId } from "../lib/userStore";

interface OnboardingPageProps {
  onComplete: (userId: string) => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  useInternetIdentity();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("wizard");

  const createUser = useCreateUser();
  const saveProfile = useSaveCallerUserProfile();

  const handleComplete = async () => {
    if (!username.trim() || !age) return;
    try {
      const userId = await createUser.mutateAsync({
        username: username.trim(),
        age: BigInt(Number.parseInt(age)),
        avatarId: selectedAvatar,
      });
      await saveProfile.mutateAsync({
        username: username.trim(),
        age: BigInt(Number.parseInt(age)),
        avatarId: selectedAvatar,
      });
      saveUserId(userId);
      onComplete(userId);
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  const isLoading = createUser.isPending || saveProfile.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏰</div>
          <h1 className="font-heading text-3xl font-bold text-gold">
            Create Your Hero
          </h1>
          <p className="text-muted-foreground mt-1">Step {step + 1} of 3</p>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i <= step ? "bg-gold" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 0: Choose Avatar */}
        {step === 0 && (
          <div>
            <h2 className="font-heading text-xl text-center text-foreground mb-4">
              Choose Your Hero
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-3 rounded-2xl border-2 transition-all text-center ${
                    selectedAvatar === avatar.id
                      ? "border-gold bg-gold/10 scale-105"
                      : "border-border bg-card hover:border-gold/50"
                  }`}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-20 h-20 mx-auto object-contain mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement)
                        .parentElement;
                      if (parent) {
                        const span = document.createElement("span");
                        span.className = "text-5xl block mb-2";
                        span.textContent = avatar.emoji;
                        parent.insertBefore(span, parent.firstChild);
                      }
                    }}
                  />
                  <div className="font-heading font-bold text-sm text-foreground">
                    {avatar.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {avatar.description}
                  </div>
                </button>
              ))}
            </div>
            <RPGButton
              variant="gold"
              size="lg"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Choose This Hero →
            </RPGButton>
          </div>
        )}

        {/* Step 1: Enter Name */}
        {step === 1 && (
          <div>
            <h2 className="font-heading text-xl text-center text-foreground mb-4">
              Name Your Hero
            </h2>
            <div className="mb-4">
              <label
                htmlFor="hero-name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Hero Name
              </label>
              <input
                id="hero-name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your hero name..."
                maxLength={20}
                className="w-full bg-card border-2 border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <RPGButton variant="navy" size="md" onClick={() => setStep(0)}>
                ← Back
              </RPGButton>
              <RPGButton
                variant="gold"
                size="md"
                className="flex-1"
                disabled={!username.trim()}
                onClick={() => setStep(2)}
              >
                Next →
              </RPGButton>
            </div>
          </div>
        )}

        {/* Step 2: Enter Age */}
        {step === 2 && (
          <div>
            <h2 className="font-heading text-xl text-center text-foreground mb-4">
              How Old Are You?
            </h2>
            <div className="mb-6">
              <label
                htmlFor="hero-age"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your Age
              </label>
              <input
                id="hero-age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age..."
                min="5"
                max="100"
                className="w-full bg-card border-2 border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
              />
            </div>
            {(createUser.isError || saveProfile.isError) && (
              <p className="text-red-400 text-sm mb-3 text-center">
                Something went wrong. Please try again.
              </p>
            )}
            <div className="flex gap-3">
              <RPGButton variant="navy" size="md" onClick={() => setStep(1)}>
                ← Back
              </RPGButton>
              <RPGButton
                variant="gold"
                size="md"
                className="flex-1"
                disabled={!age || Number.parseInt(age) < 5}
                loading={isLoading}
                onClick={handleComplete}
              >
                Begin Quest! ⚔️
              </RPGButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
