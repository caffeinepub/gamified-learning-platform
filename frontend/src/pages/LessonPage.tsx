import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetLessonsByWorld, useRecordLessonResult } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { getQuestionsForLesson, type Question, WORLD_THEMES } from '@/lib/gameData';
import { type Lesson } from '@/backend';
import RPGButton from '@/components/RPGButton';
import XPGainAnimation from '@/components/animations/XPGainAnimation';
import CoinGemAnimation from '@/components/animations/CoinGemAnimation';
import BossEntranceAnimation from '@/components/animations/BossEntranceAnimation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export default function LessonPage() {
  const { worldId } = useParams({ from: '/lesson/$worldId' });
  const navigate = useNavigate();
  const userId = loadUserId();

  const { data: lessons = [], isLoading } = useGetLessonsByWorld(worldId);
  const recordResult = useRecordLessonResult();

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillAnswer, setFillAnswer] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showBossEntrance, setShowBossEntrance] = useState(false);
  const [bossEntranceDone, setBossEntranceDone] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const currentLesson: Lesson | undefined = lessons[currentLessonIndex];
  const questions = currentLesson
    ? getQuestionsForLesson(currentLesson.subject, currentLesson.difficulty)
    : [];
  const currentQuestion: Question | undefined = questions[currentQuestionIndex];

  // Show boss entrance for boss battles
  useEffect(() => {
    if (currentLesson?.isBossBattle && !bossEntranceDone) {
      setShowBossEntrance(true);
    }
  }, [currentLesson, bossEntranceDone]);

  const handleAnswer = useCallback((answer: string) => {
    if (answerState !== 'unanswered') return;
    const isCorrect = answer.trim().toLowerCase() === currentQuestion?.correctAnswer.toLowerCase();
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    setSelectedAnswer(answer);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setShowXP(true);
    } else {
      setShakeKey(k => k + 1);
      setShowHint(true);
    }
  }, [answerState, currentQuestion]);

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerState('unanswered');
      setSelectedAnswer('');
      setFillAnswer('');
      setShowHint(false);
    } else {
      // Lesson complete
      const score = Math.round((correctCount / questions.length) * 100);
      if (userId && currentLesson) {
        try {
          await recordResult.mutateAsync({
            userId,
            lessonId: currentLesson.id,
            score: BigInt(score),
          });
          setShowCoins(true);
        } catch {
          // ignore
        }
      }
      setLessonComplete(true);
    }
  }, [currentQuestionIndex, questions.length, correctCount, userId, currentLesson, recordResult]);

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setAnswerState('unanswered');
      setSelectedAnswer('');
      setFillAnswer('');
      setShowHint(false);
      setCorrectCount(0);
      setLessonComplete(false);
      setBossEntranceDone(false);
    } else {
      navigate({ to: '/world-map' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-gold-DEFAULT border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-body">Loading lessons...</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="text-6xl">📚</div>
        <h2 className="font-heading text-2xl" style={{ color: 'oklch(0.88 0.14 85)' }}>No Lessons Yet</h2>
        <p className="text-muted-foreground font-body text-center">This world doesn't have any lessons yet.</p>
        <RPGButton variant="navy" onClick={() => navigate({ to: '/world-map' })}>
          ← Back to Map
        </RPGButton>
      </div>
    );
  }

  const theme = currentLesson ? (WORLD_THEMES[currentLesson.worldId] || { emoji: '🌍', color: '#888' }) : { emoji: '🌍', color: '#888' };
  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col px-4 py-4">
      {/* Boss Entrance */}
      {showBossEntrance && !bossEntranceDone && (
        <BossEntranceAnimation onComplete={() => { setShowBossEntrance(false); setBossEntranceDone(true); }} />
      )}

      {/* XP Animation */}
      {showXP && <XPGainAnimation amount={Number(currentLesson?.xpReward || 50)} onComplete={() => setShowXP(false)} />}

      {/* Coin Animation */}
      {showCoins && (
        <CoinGemAnimation
          coins={Number(currentLesson?.coinReward || 10)}
          onComplete={() => setShowCoins(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate({ to: '/world-map' })} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <p className="font-heading text-sm" style={{ color: 'oklch(0.88 0.14 85)' }}>
            {currentLesson?.isBossBattle ? '⚔️ Boss Battle' : `Lesson ${currentLessonIndex + 1}/${lessons.length}`}
          </p>
          <p className="text-muted-foreground text-xs font-body">{currentLesson?.title}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
          <span style={{ color: 'oklch(0.62 0.2 155)' }}>+{Number(currentLesson?.xpReward || 50)} XP</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground font-body mt-1 text-right">
          {currentQuestionIndex}/{questions.length} questions
        </p>
      </div>

      {/* Lesson Complete Screen */}
      {lessonComplete ? (
        <div className="flex flex-col items-center gap-6 py-8 animate-bounce-in">
          <div className="text-7xl">{correctCount === questions.length ? '🏆' : correctCount >= questions.length * 0.6 ? '⭐' : '📚'}</div>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
              {correctCount === questions.length ? 'Perfect!' : correctCount >= questions.length * 0.6 ? 'Well Done!' : 'Keep Practicing!'}
            </h2>
            <p className="text-muted-foreground font-body">
              {correctCount}/{questions.length} correct answers
            </p>
          </div>
          <div className="rpg-card rpg-card-gold w-full text-center">
            <p className="font-heading text-2xl" style={{ color: 'oklch(0.88 0.14 85)' }}>
              Score: {Math.round((correctCount / questions.length) * 100)}%
            </p>
            <p className="text-muted-foreground font-body text-sm mt-1">
              +{Number(currentLesson?.xpReward || 50)} XP earned!
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <RPGButton variant="navy" size="md" onClick={() => navigate({ to: '/world-map' })} className="flex-1">
              🗺️ Map
            </RPGButton>
            <RPGButton variant="gold" size="md" onClick={handleNextLesson} className="flex-1">
              {currentLessonIndex < lessons.length - 1 ? 'Next Lesson →' : '🏆 Complete!'}
            </RPGButton>
          </div>
        </div>
      ) : currentQuestion ? (
        <div className="flex flex-col gap-5 flex-1">
          {/* Question Card */}
          <div
            key={`${currentLessonIndex}-${currentQuestionIndex}-${shakeKey}`}
            className={cn(
              'rpg-card flex-1',
              answerState === 'incorrect' && 'animate-shake',
              currentLesson?.isBossBattle && 'rpg-card-gold'
            )}
            style={currentLesson?.isBossBattle ? {
              borderColor: 'oklch(0.58 0.22 27 / 0.6)',
              boxShadow: '0 0 20px oklch(0.58 0.22 27 / 0.2)',
            } : {}}>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{currentLesson?.isBossBattle ? '👹' : '❓'}</span>
              <p className="font-body text-base leading-relaxed text-foreground flex-1">
                {currentQuestion.text}
              </p>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="flex items-start gap-2 p-3 rounded-xl mb-4"
                style={{ background: 'oklch(0.22 0.06 265)', border: '1px solid oklch(0.78 0.16 85 / 0.3)' }}>
                <Lightbulb size={16} style={{ color: 'oklch(0.78 0.16 85)', flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm font-body" style={{ color: 'oklch(0.88 0.14 85)' }}>
                  {currentQuestion.hint}
                </p>
              </div>
            )}

            {/* Answer Options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  let btnStyle: React.CSSProperties = {};
                  let btnClass = 'rpg-card cursor-pointer text-center py-3 px-2 font-body font-semibold text-sm transition-all duration-200';

                  if (answerState !== 'unanswered') {
                    if (isCorrectOption) {
                      btnStyle = { borderColor: 'oklch(0.55 0.18 155)', background: 'oklch(0.55 0.18 155 / 0.2)', boxShadow: '0 0 10px oklch(0.55 0.18 155 / 0.3)' };
                    } else if (isSelected && !isCorrectOption) {
                      btnStyle = { borderColor: 'oklch(0.58 0.22 27)', background: 'oklch(0.58 0.22 27 / 0.2)' };
                    }
                  } else {
                    btnClass += ' hover:scale-105';
                    btnStyle = { borderColor: 'oklch(0.35 0.06 265)' };
                  }

                  return (
                    <button
                      key={option}
                      className={btnClass}
                      style={btnStyle}
                      onClick={() => handleAnswer(option)}
                      disabled={answerState !== 'unanswered'}>
                      {answerState !== 'unanswered' && isCorrectOption && <CheckCircle size={14} className="inline mr-1" style={{ color: 'oklch(0.55 0.18 155)' }} />}
                      {answerState !== 'unanswered' && isSelected && !isCorrectOption && <XCircle size={14} className="inline mr-1" style={{ color: 'oklch(0.58 0.22 27)' }} />}
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'fill-blank' && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && answerState === 'unanswered' && handleAnswer(fillAnswer)}
                  placeholder="Type your answer..."
                  disabled={answerState !== 'unanswered'}
                  className="w-full px-4 py-3 rounded-xl font-body text-base"
                  style={{
                    background: 'oklch(0.18 0.04 265)',
                    border: `2px solid ${answerState === 'correct' ? 'oklch(0.55 0.18 155)' : answerState === 'incorrect' ? 'oklch(0.58 0.22 27)' : 'oklch(0.35 0.06 265)'}`,
                    color: 'oklch(0.97 0.01 265)',
                    outline: 'none',
                  }}
                />
                {answerState === 'unanswered' && (
                  <RPGButton variant="emerald" size="md" onClick={() => handleAnswer(fillAnswer)} className="w-full">
                    Submit Answer
                  </RPGButton>
                )}
              </div>
            )}
          </div>

          {/* Feedback & Next */}
          {answerState !== 'unanswered' && (
            <div className="flex flex-col gap-3 animate-bounce-in">
              <div className={cn(
                'flex items-center gap-3 p-4 rounded-2xl font-body font-semibold',
              )}
                style={{
                  background: answerState === 'correct' ? 'oklch(0.55 0.18 155 / 0.2)' : 'oklch(0.58 0.22 27 / 0.2)',
                  border: `2px solid ${answerState === 'correct' ? 'oklch(0.55 0.18 155)' : 'oklch(0.58 0.22 27)'}`,
                }}>
                <span className="text-2xl">{answerState === 'correct' ? '✅' : '❌'}</span>
                <div>
                  <p style={{ color: answerState === 'correct' ? 'oklch(0.62 0.2 155)' : 'oklch(0.65 0.22 27)' }}>
                    {answerState === 'correct' ? 'Correct! Amazing!' : `Incorrect. Answer: ${currentQuestion.correctAnswer}`}
                  </p>
                </div>
              </div>
              <RPGButton variant={answerState === 'correct' ? 'emerald' : 'navy'} size="md" onClick={handleNext} className="w-full">
                {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Lesson! 🏆'}
              </RPGButton>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
