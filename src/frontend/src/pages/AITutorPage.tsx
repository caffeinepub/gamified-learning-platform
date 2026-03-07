import { Bot, Send } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Subject } from "../backend";
import RPGButton from "../components/RPGButton";
import { useGetTutorRecommendation, useGetUser } from "../hooks/useQueries";
import { DIFFICULTY_LABELS } from "../lib/gameData";
import { loadUserId } from "../lib/userStore";

interface AITutorPageProps {
  userId: string;
}

interface Message {
  id: string;
  role: "user" | "tutor";
  content: string;
  timestamp: Date;
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

function getTutorResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  if (
    lower.includes("math") ||
    lower.includes("number") ||
    lower.includes("algebra")
  ) {
    return getRandomResponse("math");
  }
  if (
    lower.includes("english") ||
    lower.includes("word") ||
    lower.includes("read") ||
    lower.includes("grammar")
  ) {
    return getRandomResponse("english");
  }
  if (
    lower.includes("help") ||
    lower.includes("hint") ||
    lower.includes("stuck")
  ) {
    return getRandomResponse("hint");
  }
  if (
    lower.includes("hard") ||
    lower.includes("difficult") ||
    lower.includes("fail")
  ) {
    return getRandomResponse("encouragement");
  }
  return `Great question! 🤔 Keep exploring and practicing. ${getRandomResponse("encouragement")}`;
}

const QUICK_PROMPTS = [
  "Help me with math",
  "Explain grammar rules",
  "Give me a hint!",
  "Encourage me!",
];

export default function AITutorPage({ userId: propUserId }: AITutorPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: user } = useGetUser(userId);
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.math);
  const { data: recommendation } = useGetTutorRecommendation(
    userId,
    activeSubject,
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "tutor",
      content: getRandomResponse("greeting"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef is a stable ref, scroll on message change is intentional
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = getTutorResponse(text);
    const tutorMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "tutor",
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tutorMsg]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Bot size={20} className="text-gold" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-foreground">AI Tutor</h1>
            {user && (
              <p className="text-xs text-muted-foreground">
                Hello, {user.username}! Level {Number(user.level)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subject selector */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-2 max-w-sm mx-auto">
          {[Subject.math, Subject.english].map((subject) => (
            <button
              type="button"
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                activeSubject === subject
                  ? "bg-gold text-navy-dark"
                  : "bg-card border border-border text-muted-foreground hover:border-gold/50"
              }`}
            >
              {subject === Subject.math ? "🔢 Math" : "📖 English"}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation banner */}
      {recommendation && (
        <div className="px-4 py-3 bg-gold/5 border-b border-gold/20">
          <div className="max-w-sm mx-auto">
            <p className="text-xs text-gold font-bold mb-0.5">
              📊 Tutor Recommendation
            </p>
            <p className="text-xs text-muted-foreground">
              {recommendation.hint} · Difficulty:{" "}
              {DIFFICULTY_LABELS[recommendation.difficultyAdjustment] ||
                recommendation.difficultyAdjustment}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-sm mx-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  msg.role === "tutor"
                    ? "bg-gold/20 text-gold"
                    : "bg-card border border-border"
                }`}
              >
                {msg.role === "tutor" ? "🧙" : "⚔️"}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "tutor"
                    ? "bg-card border border-border text-foreground"
                    : "bg-gold/20 border border-gold/30 text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-sm">
                🧙
              </div>
              <div className="bg-card border border-border rounded-2xl px-3 py-2">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 border-t border-border">
        <div className="max-w-sm mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              type="button"
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="flex-shrink-0 text-xs bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:border-gold/50 hover:text-foreground transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="max-w-sm mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask your tutor anything..."
            className="flex-1 bg-card border-2 border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none text-sm"
          />
          <RPGButton
            variant="gold"
            size="sm"
            disabled={!input.trim() || isTyping}
            onClick={() => sendMessage(input)}
          >
            <Send size={16} />
          </RPGButton>
        </div>
      </div>
    </div>
  );
}
