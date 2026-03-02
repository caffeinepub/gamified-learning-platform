import React, { useState } from 'react';
import { useGetTutorRecommendation, useGetUser, useListLessons } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { Subject, Difficulty } from '@/backend';
import { SUBJECT_LABELS, DIFFICULTY_LABELS, AVATAR_OPTIONS } from '@/lib/gameData';
import RPGButton from '@/components/RPGButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from '@tanstack/react-router';

interface ChatMessage {
  role: 'tutor' | 'user';
  text: string;
}

const TUTOR_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Hello, brave scholar! 🧙‍♂️ I'm your AI Tutor. What would you like to learn today?",
    "Welcome back, hero! Ready to level up your knowledge? 📚",
    "Greetings, adventurer! Let's conquer some knowledge together! ⚔️",
  ],
  math: [
    "Math is the language of the universe! 🌌 Let's start with the basics and work our way up.",
    "Numbers are your weapons in battle! 🔢 Practice makes perfect.",
    "Every great mathematician started where you are now. Keep going! 💪",
  ],
  english: [
    "Words are your most powerful spells! 📖 Let's master the art of language.",
    "Reading and writing open doors to infinite worlds! 🌍",
    "Every story you read makes you a stronger writer. Keep exploring! ✨",
  ],
  encouragement: [
    "You're doing amazing! Every mistake is a lesson in disguise. 🌟",
    "Don't give up! Even the greatest heroes struggled at first. ⚔️",
    "Progress, not perfection! You're getting better every day. 🚀",
  ],
  hint: [
    "Here's a secret strategy: break the problem into smaller pieces! 🧩",
    "Try working backwards from the answer — it often reveals the path! 🔍",
    "Remember: practice the fundamentals and the advanced stuff becomes easy! 💡",
  ],
};

function getRandomResponse(category: keyof typeof TUTOR_RESPONSES): string {
  const arr = TUTOR_RESPONSES[category];
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AITutorPage() {
  const userId = loadUserId();
  const navigate = useNavigate();
  const { data: user } = useGetUser(userId);
  const { data: allLessons = [] } = useListLessons();
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.math);
  const { data: recommendation } = useGetTutorRecommendation(userId, activeSubject);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'tutor', text: getRandomResponse('greeting') },
  ]);
  const [inputText, setInputText] = useState('');

  const avatarId = user?.avatarId || 'wizard';
  const avatarImg = AVATAR_OPTIONS.find((a) => a.id === avatarId)?.image || AVATAR_OPTIONS[0].image;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);

    // Rule-based response
    let response = '';
    const lower = userMsg.toLowerCase();
    if (lower.includes('math') || lower.includes('number') || lower.includes('algebra')) {
      response = getRandomResponse('math');
    } else if (lower.includes('english') || lower.includes('word') || lower.includes('read')) {
      response = getRandomResponse('english');
    } else if (lower.includes('help') || lower.includes('hint') || lower.includes('stuck')) {
      response = getRandomResponse('hint');
    } else if (lower.includes('hard') || lower.includes('difficult') || lower.includes('fail')) {
      response = getRandomResponse('encouragement');
    } else {
      response = `Great question! 🤔 Keep exploring and practicing. ${getRandomResponse('encouragement')}`;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'tutor', text: response }]);
    }, 600);
  };

  const recommendedLesson = allLessons.find((l) => l.id === recommendation?.recommendedLesson);

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      <div className="text-center mb-2">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🤖 AI Tutor
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Your personalized learning companion
        </p>
      </div>

      {/* Tutor avatar & recommendation */}
      <div
        className="rpg-card rpg-card-gold flex items-center gap-4"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, oklch(0.45 0.2 295), oklch(0.35 0.18 265))',
            border: '3px solid oklch(0.78 0.16 85)',
          }}
        >
          <span className="text-3xl">🧙‍♂️</span>
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-base" style={{ color: 'oklch(0.88 0.14 85)' }}>
            Sage Mentor
          </p>
          <p className="text-sm font-body text-muted-foreground">
            {recommendation?.hint || 'Ready to guide your learning journey!'}
          </p>
        </div>
      </div>

      {/* Subject tabs for recommendation */}
      <Tabs
        value={activeSubject}
        onValueChange={(v) => setActiveSubject(v as Subject)}
      >
        <TabsList
          className="w-full"
          style={{ background: 'oklch(0.18 0.04 265)', border: '1px solid oklch(0.3 0.05 265)' }}
        >
          <TabsTrigger value={Subject.math} className="flex-1 font-heading font-bold">
            🔢 Math
          </TabsTrigger>
          <TabsTrigger value={Subject.english} className="flex-1 font-heading font-bold">
            📚 English
          </TabsTrigger>
        </TabsList>

        <TabsContent value={Subject.math}>
          <div className="rpg-card mt-3">
            <p className="font-heading text-sm font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
              📊 Recommended Next Step
            </p>
            {recommendation ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="font-body text-sm text-foreground">
                      {recommendedLesson?.title || 'Continue your Math journey'}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      Difficulty: {DIFFICULTY_LABELS[recommendation.difficultyAdjustment]}
                    </p>
                  </div>
                </div>
                <RPGButton
                  variant="emerald"
                  size="sm"
                  onClick={() => navigate({ to: '/world-map' })}
                  className="w-full"
                >
                  Go to World Map →
                </RPGButton>
              </div>
            ) : (
              <p className="text-muted-foreground font-body text-sm">
                Complete some lessons to get personalized recommendations!
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value={Subject.english}>
          <div className="rpg-card mt-3">
            <p className="font-heading text-sm font-bold mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
              📊 Recommended Next Step
            </p>
            {recommendation ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="font-body text-sm text-foreground">
                      {recommendedLesson?.title || 'Continue your English journey'}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      Difficulty: {DIFFICULTY_LABELS[recommendation.difficultyAdjustment]}
                    </p>
                  </div>
                </div>
                <RPGButton
                  variant="emerald"
                  size="sm"
                  onClick={() => navigate({ to: '/world-map' })}
                  className="w-full"
                >
                  Go to World Map →
                </RPGButton>
              </div>
            ) : (
              <p className="text-muted-foreground font-body text-sm">
                Complete some lessons to get personalized recommendations!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Chat interface */}
      <div className="flex flex-col gap-3">
        <p className="font-heading text-sm font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
          💬 Ask Your Tutor
        </p>
        <div
          className="rounded-2xl p-4 flex flex-col gap-3 max-h-64 overflow-y-auto"
          style={{
            background: 'oklch(0.16 0.03 265)',
            border: '1px solid oklch(0.3 0.05 265)',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  background:
                    msg.role === 'tutor'
                      ? 'linear-gradient(135deg, oklch(0.45 0.2 295), oklch(0.35 0.18 265))'
                      : 'oklch(0.78 0.16 85 / 0.3)',
                  border: `2px solid ${msg.role === 'tutor' ? 'oklch(0.55 0.2 295)' : 'oklch(0.78 0.16 85)'}`,
                }}
              >
                {msg.role === 'tutor' ? '🧙' : '⚔️'}
              </div>
              <div
                className="max-w-[75%] rounded-2xl px-3 py-2 text-sm font-body"
                style={{
                  background:
                    msg.role === 'tutor'
                      ? 'oklch(0.22 0.06 265)'
                      : 'oklch(0.78 0.16 85 / 0.2)',
                  border: `1px solid ${msg.role === 'tutor' ? 'oklch(0.35 0.06 265)' : 'oklch(0.78 0.16 85 / 0.4)'}`,
                  color: 'oklch(0.9 0.01 265)',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 flex-wrap">
          {['Give me a hint!', 'I need help with math', 'Encourage me!'].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInputText(prompt);
              }}
              className="text-xs font-body px-3 py-1.5 rounded-full transition-all"
              style={{
                background: 'oklch(0.22 0.06 265)',
                border: '1px solid oklch(0.35 0.06 265)',
                color: 'oklch(0.75 0.04 265)',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your tutor anything..."
            className="flex-1 px-4 py-2.5 rounded-xl font-body text-sm"
            style={{
              background: 'oklch(0.18 0.04 265)',
              border: '2px solid oklch(0.35 0.06 265)',
              color: 'oklch(0.97 0.01 265)',
              outline: 'none',
            }}
          />
          <RPGButton variant="gold" size="sm" onClick={handleSend}>
            Send
          </RPGButton>
        </div>
      </div>
    </div>
  );
}
