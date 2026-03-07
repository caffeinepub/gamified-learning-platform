import { Copy, Swords, Users } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Subject } from "../backend";
import RPGButton from "../components/RPGButton";
import {
  useCreateChallenge,
  useGetMultiplayerSession,
  useGetUser,
  useJoinChallenge,
  useResolveSession,
  useSubmitAnswers,
} from "../hooks/useQueries";
import { loadUserId } from "../lib/userStore";

interface MultiplayerPageProps {
  userId: string;
}

type BattleScreen = "lobby" | "waiting" | "battle" | "results";

export default function MultiplayerPage({
  userId: propUserId,
}: MultiplayerPageProps) {
  const userId = propUserId || loadUserId() || "";
  const { data: user } = useGetUser(userId);

  const [screen, setScreen] = useState<BattleScreen>("lobby");
  const [sessionId, setSessionId] = useState("");
  const [joinSessionId, setJoinSessionId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.math);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore] = useState(0);

  const createChallenge = useCreateChallenge();
  const joinChallenge = useJoinChallenge();
  const submitAnswers = useSubmitAnswers();
  const resolveSession = useResolveSession();
  const { data: session } = useGetMultiplayerSession(sessionId);

  const handleCreate = async () => {
    if (!userId) return;
    try {
      const id = await createChallenge.mutateAsync({
        hostId: userId,
        subject: selectedSubject,
      });
      setSessionId(id);
      setScreen("waiting");
    } catch (_error: unknown) {
      toast.error("Failed to create challenge");
    }
  };

  const handleJoin = async () => {
    if (!userId || !joinSessionId.trim()) return;
    try {
      await joinChallenge.mutateAsync({
        sessionId: joinSessionId.trim(),
        opponentId: userId,
      });
      setSessionId(joinSessionId.trim());
      setScreen("battle");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to join challenge";
      toast.error(msg);
    }
  };

  const handleStartBattle = () => {
    setScreen("battle");
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setMyScore((s) => s + 1);
  };

  const handleFinish = async () => {
    if (sessionId) {
      try {
        await submitAnswers.mutateAsync({
          sessionId,
          userId,
          answers: [{ questionId: "q1", isCorrect: myScore > 0 }],
        });
        await resolveSession.mutateAsync(sessionId);
      } catch {
        // ignore
      }
    }
    setScreen("results");
  };

  const handleReset = () => {
    setScreen("lobby");
    setSessionId("");
    setJoinSessionId("");
    setMyScore(0);
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast.success("Session ID copied!");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">
          Battle Arena
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Challenge other players!
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        {/* Lobby */}
        {screen === "lobby" && (
          <div className="space-y-4">
            <div className="bg-card border border-gold/20 rounded-2xl p-4">
              <h2 className="font-heading font-bold text-foreground mb-3">
                Create Challenge
              </h2>
              <div className="flex gap-2 mb-4">
                {[Subject.math, Subject.english].map((subject) => (
                  <button
                    type="button"
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedSubject === subject
                        ? "bg-gold text-navy-dark"
                        : "bg-background border border-border text-muted-foreground"
                    }`}
                  >
                    {subject === Subject.math ? "🔢 Math" : "📖 English"}
                  </button>
                ))}
              </div>
              <RPGButton
                variant="gold"
                size="md"
                className="w-full"
                loading={createChallenge.isPending}
                onClick={handleCreate}
              >
                <Swords size={16} className="inline mr-2" />
                Create Battle
              </RPGButton>
            </div>

            <div className="bg-card border border-gold/20 rounded-2xl p-4">
              <h2 className="font-heading font-bold text-foreground mb-3">
                Join Challenge
              </h2>
              <input
                type="text"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                placeholder="Enter session ID..."
                className="w-full bg-background border-2 border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none mb-3"
              />
              <RPGButton
                variant="emerald"
                size="md"
                className="w-full"
                disabled={!joinSessionId.trim()}
                loading={joinChallenge.isPending}
                onClick={handleJoin}
              >
                <Users size={16} className="inline mr-2" />
                Join Battle
              </RPGButton>
            </div>
          </div>
        )}

        {/* Waiting room */}
        {screen === "waiting" && (
          <div className="bg-card border-2 border-gold/40 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <h2 className="font-heading text-xl font-bold text-gold mb-2">
              Waiting for Opponent
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Share your session ID:
            </p>
            <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
              <code className="flex-1 text-gold font-mono text-sm break-all">
                {sessionId}
              </code>
              <button
                type="button"
                onClick={copySessionId}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy size={16} />
              </button>
            </div>
            {session?.status === "inProgress" ? (
              <RPGButton
                variant="gold"
                size="md"
                className="w-full"
                onClick={handleStartBattle}
              >
                Opponent Joined! Start Battle ⚔️
              </RPGButton>
            ) : (
              <p className="text-xs text-muted-foreground">
                Waiting for someone to join...
              </p>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Battle */}
        {screen === "battle" && (
          <div className="space-y-4">
            <div className="bg-card border-2 border-red-500/40 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-gold">
                    {myScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.username || "You"}
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-400">VS</div>
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-muted-foreground">
                    {opponentScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Opponent</div>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4 mb-4">
                <p className="text-foreground text-center font-medium">
                  What is 7 × 8?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["54", "56", "48", "64"].map((opt, i) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleAnswer(i === 1)}
                    className="bg-card border-2 border-border rounded-xl p-3 text-center font-bold text-foreground hover:border-gold transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <RPGButton
              variant="crimson"
              size="md"
              className="w-full"
              onClick={handleFinish}
            >
              End Battle
            </RPGButton>
          </div>
        )}

        {/* Results */}
        {screen === "results" && (
          <div className="bg-card border-2 border-gold/40 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4">
              {myScore > opponentScore
                ? "🏆"
                : myScore === opponentScore
                  ? "🤝"
                  : "😔"}
            </div>
            <h2 className="font-heading text-2xl font-bold text-gold mb-2">
              {myScore > opponentScore
                ? "Victory!"
                : myScore === opponentScore
                  ? "Draw!"
                  : "Defeat!"}
            </h2>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <div className="text-3xl font-heading font-bold text-gold">
                  {myScore}
                </div>
                <div className="text-xs text-muted-foreground">Your Score</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-muted-foreground">
                  {opponentScore}
                </div>
                <div className="text-xs text-muted-foreground">Opponent</div>
              </div>
            </div>
            <RPGButton
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleReset}
            >
              Play Again
            </RPGButton>
          </div>
        )}
      </div>
    </div>
  );
}
