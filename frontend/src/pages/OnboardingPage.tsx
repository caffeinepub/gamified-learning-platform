import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useCreateUser, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { saveUserId } from '@/lib/userStore';
import { AVATAR_OPTIONS } from '@/lib/gameData';
import RPGButton from '@/components/RPGButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [step, setStep] = useState<'welcome' | 'avatar' | 'details'>('welcome');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('wizard');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const createUser = useCreateUser();
  const saveProfile = useSaveCallerUserProfile();

  const handleStart = () => setStep('avatar');
  const handleAvatarNext = () => setStep('details');

  const handleSubmit = async () => {
    if (!username.trim()) { setError('Please enter a username!'); return; }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 4 || ageNum > 100) { setError('Please enter a valid age (4-100)!'); return; }
    setError('');

    try {
      const userId = await createUser.mutateAsync({
        username: username.trim(),
        age: BigInt(ageNum),
        avatarId: selectedAvatar,
      });
      await saveProfile.mutateAsync({
        username: username.trim(),
        age: BigInt(ageNum),
        avatarId: selectedAvatar,
      });
      saveUserId(userId);
      navigate({ to: '/world-map' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('trap') ? 'Something went wrong. Please try again.' : msg);
    }
  };

  const isLoading = createUser.isPending || saveProfile.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
            }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="flex flex-col items-center gap-8 text-center animate-bounce-in">
            <div className="text-8xl animate-bounce">🏰</div>
            <div>
              <h1 className="font-heading text-5xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.88 0.14 85), oklch(0.78 0.16 85))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                EduQuest
              </h1>
              <p className="font-heading text-2xl" style={{ color: 'oklch(0.75 0.18 265)' }}>
                Academy
              </p>
            </div>
            <div className="rpg-card rpg-card-gold w-full">
              <p className="text-foreground/90 text-base leading-relaxed font-body">
                ⚔️ Embark on an epic learning adventure! Master Math & English, defeat bosses, and become the ultimate Scholar Hero!
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <RPGButton variant="gold" size="lg" onClick={handleStart} className="w-full">
                🚀 Begin Your Quest!
              </RPGButton>
              {!identity && (
                <p className="text-muted-foreground text-xs text-center font-body">
                  You'll need to log in to save your progress
                </p>
              )}
            </div>
          </div>
        )}

        {/* Avatar Selection Step */}
        {step === 'avatar' && (
          <div className="flex flex-col gap-6 animate-bounce-in">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
                Choose Your Hero!
              </h2>
              <p className="text-muted-foreground font-body text-sm">Pick your champion for the journey ahead</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={cn(
                    'rpg-card flex flex-col items-center gap-3 p-4 transition-all duration-200 cursor-pointer',
                    selectedAvatar === avatar.id ? 'rpg-card-gold scale-105' : 'hover:scale-102'
                  )}
                  style={selectedAvatar === avatar.id ? {
                    borderColor: 'oklch(0.78 0.16 85)',
                    boxShadow: '0 0 20px oklch(0.78 0.16 85 / 0.4)',
                  } : {}}>
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-20 h-20 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                  />
                  <div className="text-center">
                    <p className="font-heading font-bold text-base" style={{ color: selectedAvatar === avatar.id ? 'oklch(0.88 0.14 85)' : 'oklch(0.97 0.01 265)' }}>
                      {avatar.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">{avatar.description}</p>
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute top-2 right-2 text-lg">✓</div>
                  )}
                </button>
              ))}
            </div>
            <RPGButton variant="gold" size="lg" onClick={handleAvatarNext} className="w-full">
              Continue →
            </RPGButton>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <div className="flex flex-col gap-6 animate-bounce-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img
                  src={AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.image}
                  alt="Selected avatar"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h2 className="font-heading text-3xl font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
                Name Your Hero!
              </h2>
              <p className="text-muted-foreground font-body text-sm">Tell us about yourself, brave adventurer</p>
            </div>
            <div className="rpg-card flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="font-heading text-sm" style={{ color: 'oklch(0.88 0.14 85)' }}>
                  Hero Name
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your hero name..."
                  maxLength={20}
                  className="font-body"
                  style={{
                    background: 'oklch(0.18 0.04 265)',
                    borderColor: 'oklch(0.35 0.06 265)',
                    color: 'oklch(0.97 0.01 265)',
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-heading text-sm" style={{ color: 'oklch(0.88 0.14 85)' }}>
                  Your Age
                </Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="How old are you?"
                  min={4}
                  max={100}
                  className="font-body"
                  style={{
                    background: 'oklch(0.18 0.04 265)',
                    borderColor: 'oklch(0.35 0.06 265)',
                    color: 'oklch(0.97 0.01 265)',
                  }}
                />
              </div>
              {error && (
                <p className="text-sm font-body" style={{ color: 'oklch(0.65 0.22 27)' }}>
                  ⚠️ {error}
                </p>
              )}
            </div>
            <RPGButton
              variant="gold"
              size="lg"
              onClick={handleSubmit}
              loading={isLoading}
              className="w-full">
              ⚔️ Start Adventure!
            </RPGButton>
            <button
              onClick={() => setStep('avatar')}
              className="text-muted-foreground text-sm font-body hover:text-foreground transition-colors">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
