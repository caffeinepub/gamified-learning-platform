import React, { useState } from 'react';
import {
  useCreateChallenge,
  useJoinChallenge,
  useSubmitAnswers,
  useResolveSession,
  useGetMultiplayerSession,
  useGetUser,
} from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { Subject, SessionStatus } from '@/backend';
import { getQuestionsForLesson, SUBJECT_LABELS } from '@/lib/gameData';
import { Difficulty } from '@/backend';
import RPGButton from '@/components/RPGButton';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const BATTLE_QUESTIONS = getQuestionsForLesson(Subject.math, Difficulty.intermediate).slice(0, 5);

export default function MultiplayerPage() {
  const userId = loadUserId();
  const { data: user } = useGetUser(userId);
  const createChallenge = useCreateChallenge();
  const joinChallenge = useJoinChallenge();
  const submitAnswers = useSubmitAnswers();
  const resolveSession = useResolveSession();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.math);
  const [phase, setPhase] = useState<'lobby' | 'waiting' | 'battle' | 'result'>('lobby');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; isCorrect: boolean }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);

  const { data: session } = useGetMultiplayerSession(sessionId);

  const handleCreateChallenge = async () => {
    if (!userId) return;
    try {
      const id = await createChallenge.mutateAsync({ hostId: userId, subject: selectedSubject });
      setSessionId(id);
      setPhase('waiting');
      toast.success(`Challenge created! Share ID: ${id}`);
    } catch {
      toast.error('Failed to create challenge.');
    }
  };

  const handleJoinChallenge = async () => {
    if (!userId || !joinSessionId.trim()) return;
    try {
      await joinChallenge.mutateAsync({ sessionId: joinSessionId.trim(), opponentId: userId });
      setSessionId(joinSessionId.trim());
      setPhase('battle');
      startTimer();
      toast.success('Joined challenge! Battle begins!');
    } catch {
      toast.error('Could not join challenge. Check the session ID.');
    }
  };

  const startTimer = () => {
    setTimeLeft(90);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleBattleEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answer: string) => {
    if (answerState !== 'unanswered') return;
    const q = BATTLE_QUESTIONS[currentQ];
    const isCorrect = answer.toLowerCase() === q.correctAnswer.toLowerCase();
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    setSelectedAnswer(answer);
    if (isCorrect) setScore((s) => s + 1);
    const newAnswers = [...answers, { questionId: q.id, isCorrect }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < BATTLE_QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1);
        setAnswerState('unanswered');
        setSelectedAnswer('');
      } else {
        handleBattleEnd(newAnswers);
      }
    }, 800);
  };

  const handleBattleEnd = async (
    finalAnswers?: { questionId: string; isCorrect: boolean }[]
  ) => {
    const ans = finalAnswers || answers;
    if (userId && sessionId) {
      try {
        await submitAnswers.mutateAsync({ sessionId, userId, answers: ans });
        await resolveSession.mutateAsync(sessionId);
      } catch {
        // ignore
      }
    }
    setPhase('result');
  };

  const handleStartBattle = () => {
    setPhase('battle');
    startTimer();
  };

  const handleReset = () => {
    setPhase('lobby');
    setSessionId(null);
    setJoinSessionId('');
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer('');
    setAnswerState('unanswered');
    setScore(0);
    setTimeLeft(90);
  };

  const q = BATTLE_QUESTIONS[currentQ];

  return (
    <div className="px-4 py-6">
      <Toaster />
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          ⚔️ Multiplayer Battle
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Challenge friends to knowledge duels!
        </p>
      </div>

      {/* Lobby */}
      {phase === 'lobby' && (
        <div className="flex flex-col gap-5">
          {/* Create Challenge */}
          <div className="rpg-card rpg-card-gold flex flex-col gap-4">
            <p className="font-heading text-lg font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
              ⚔️ Create a Challenge
            </p>
            <div className="flex gap-2">
              {([Subject.math, Subject.english] as Subject[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={cn(
                    'flex-1 py-2 rounded-xl font-heading font-bold text-sm transition-all',
                    selectedSubject === s
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                  style={
                    selectedSubject === s
                      ? {
                          background: 'oklch(0.78 0.16 85 / 0.2)',
                          border: '2px solid oklch(0.78 0.16 85)',
                        }
                      : {
                          background: 'oklch(0.18 0.04 265)',
                          border: '2px solid oklch(0.3 0.05 265)',
                        }
                  }
                >
                  {SUBJECT_LABELS[s]}
                </button>
              ))}
            </div>
            <RPGButton
              variant="gold"
              size="md"
              onClick={handleCreateChallenge}
              loading={createChallenge.isPending}
              className="w-full"
            >
              Create Challenge!
            </RPGButton>
          </div>

          {/* Join Challenge */}
          <div className="rpg-card flex flex-col gap-4">
            <p className="font-heading text-lg font-bold" style={{ color: 'oklch(0.65 0.15 220)' }}>
              🤝 Join a Challenge
            </p>
            <div className="flex flex-col gap-2">
              <Label className="font-heading text-sm text-muted-foreground">Session ID</Label>
              <Input
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                placeholder="Enter session ID..."
                className="font-body"
                style={{
                  background: 'oklch(0.18 0.04 265)',
                  borderColor: 'oklch(0.35 0.06 265)',
                  color: 'oklch(0.97 0.01 265)',
                }}
              />
            </div>
            <RPGButton
              variant="navy"
              size="md"
              onClick={handleJoinChallenge}
              loading={joinChallenge.isPending}
              disabled={!joinSessionId.trim()}
              className="w-full"
            >
              Join Battle!
            </RPGButton>
          </div>

          {/* Info */}
          <div className="rpg-card">
            <p className="font-heading text-sm font-bold mb-3" style={{ color: 'oklch(0.88 0.14 85)' }}>
              📋 How it works
            </p>
            <ul className="flex flex-col gap-2 text-sm font-body text-muted-foreground">
              <li>⚡ Answer 5 questions as fast as you can</li>
              <li>⏱️ 90 seconds on the clock</li>
              <li>🏆 Most correct answers wins</li>
              <li>💰 Winner earns 150 XP + 50 coins</li>
            </ul>
          </div>
        </div>
      )}

      {/* Waiting for opponent */}
      {phase === 'waiting' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin"
            style={{ borderColor: 'oklch(0.78 0.16 85)', borderTopColor: 'transparent' }}
          />
          <div className="text-center">
            <p className="font-heading text-xl font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
              Waiting for Opponent...
            </p>
            <p className="text-muted-foreground font-body text-sm mb-4">
              Share this Session ID with your friend:
            </p>
            <div
              className="rpg-card rpg-card-gold px-6 py-3 text-center"
            >
              <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
                {sessionId}
              </p>
            </div>
          </div>
          <RPGButton variant="emerald" size="md" onClick={handleStartBattle} className="w-full">
            ▶️ Start Battle Now!
          </RPGButton>
          <button onClick={handleReset} className="text-muted-foreground text-sm font-body hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      {/* Battle */}
      {phase === 'battle' && q && (
        <div className="flex flex-col gap-5">
          {/* Timer & progress */}
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-sm text-muted-foreground">
              Q {currentQ + 1}/{BATTLE_QUESTIONS.length}
            </p>
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full font-heading font-bold text-sm"
              style={{
                background: timeLeft <= 10 ? 'oklch(0.58 0.22 27 / 0.2)' : 'oklch(0.22 0.06 265)',
                border: `2px solid ${timeLeft <= 10 ? 'oklch(0.58 0.22 27)' : 'oklch(0.35 0.06 265)'}`,
                color: timeLeft <= 10 ? 'oklch(0.65 0.22 27)' : 'oklch(0.88 0.14 85)',
              }}
            >
              ⏱️ {timeLeft}s
            </div>
            <p className="font-heading font-bold text-sm" style={{ color: 'oklch(0.62 0.2 155)' }}>
              Score: {score}
            </p>
          </div>

          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{ width: `${(currentQ / BATTLE_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div
            className="rpg-card"
            style={
              answerState === 'correct'
                ? { borderColor: 'oklch(0.55 0.18 155)', background: 'oklch(0.18 0.06 155 / 0.3)' }
                : answerState === 'incorrect'
                ? { borderColor: 'oklch(0.58 0.22 27)', background: 'oklch(0.18 0.06 27 / 0.3)' }
                : {}
            }
          >
            <p className="font-body text-base leading-relaxed mb-4">{q.text}</p>
            {q.type === 'multiple-choice' && q.options && (
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrectOpt = opt === q.correctAnswer;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={answerState !== 'unanswered'}
                      className="rpg-card py-3 px-2 font-body font-semibold text-sm text-center transition-all"
                      style={
                        answerState !== 'unanswered'
                          ? isCorrectOpt
                            ? { borderColor: 'oklch(0.55 0.18 155)', background: 'oklch(0.55 0.18 155 / 0.2)' }
                            : isSelected
                            ? { borderColor: 'oklch(0.58 0.22 27)', background: 'oklch(0.58 0.22 27 / 0.2)' }
                            : {}
                          : {}
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && (
        <div className="flex flex-col items-center gap-6 py-8 animate-bounce-in">
          <div className="text-7xl">{score >= 4 ? '🏆' : score >= 2 ? '⭐' : '📚'}</div>
          <div className="text-center">
            <p className="font-heading text-3xl font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
              Battle Complete!
            </p>
            <p className="text-muted-foreground font-body">
              You answered {score}/{BATTLE_QUESTIONS.length} correctly
            </p>
          </div>
          <div
            className="rpg-card rpg-card-gold w-full text-center py-4"
          >
            <p className="font-heading text-4xl font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
              {score}/{BATTLE_QUESTIONS.length}
            </p>
            <p className="text-muted-foreground font-body text-sm mt-1">
              {score >= 4 ? '+150 XP + 50 coins earned!' : '+30 XP for participating!'}
            </p>
          </div>
          <RPGButton variant="gold" size="lg" onClick={handleReset} className="w-full">
            🔄 Play Again!
          </RPGButton>
        </div>
      )}
    </div>
  );
}
