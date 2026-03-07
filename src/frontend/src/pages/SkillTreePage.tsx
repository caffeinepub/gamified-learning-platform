import { CheckCircle, Lock, Unlock } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Subject } from "../backend";
import RPGButton from "../components/RPGButton";
import { Skeleton } from "../components/ui/skeleton";
import {
  useGetSkillTree,
  useGetUser,
  useGetUserSkillNodes,
  useUnlockSkillNode,
} from "../hooks/useQueries";
import { loadUserId } from "../lib/userStore";

interface SkillTreePageProps {
  userId: string;
}

export default function SkillTreePage({
  userId: propUserId,
}: SkillTreePageProps) {
  const userId = propUserId || loadUserId() || "";
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.math);

  const { data: skillNodes, isLoading: nodesLoading } =
    useGetSkillTree(activeSubject);
  const { data: userSkillNodes, isLoading: userNodesLoading } =
    useGetUserSkillNodes(userId);
  const { data: user } = useGetUser(userId);
  const unlockNode = useUnlockSkillNode();

  const isLoading = nodesLoading || userNodesLoading;

  const unlockedNodeIds = new Set(
    userSkillNodes
      ?.filter((usn) => usn.unlocked)
      .map((usn) => usn.skillNodeId) || [],
  );

  const getNodeStatus = (
    nodeId: string,
    requiredLevel: bigint,
    prerequisiteIds: string[],
  ) => {
    if (unlockedNodeIds.has(nodeId)) return "unlocked";
    const userLevel = user ? Number(user.level) : 0;
    if (userLevel < Number(requiredLevel)) return "locked";
    const prereqsMet = prerequisiteIds.every((id) => unlockedNodeIds.has(id));
    if (!prereqsMet) return "locked";
    return "available";
  };

  const handleUnlock = async (nodeId: string) => {
    if (!userId) return;
    try {
      await unlockNode.mutateAsync({ userId, nodeId });
      toast.success("Skill node unlocked!");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to unlock skill node";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">
          Skill Tree
        </h1>
        {user && (
          <p className="text-muted-foreground text-sm mt-1">
            Level {Number(user.level)}
          </p>
        )}
      </div>

      {/* Subject tabs */}
      <div className="flex gap-2 mb-6 max-w-sm mx-auto">
        {[Subject.math, Subject.english].map((subject) => (
          <button
            type="button"
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-sm transition-all ${
              activeSubject === subject
                ? "bg-gold text-navy-dark"
                : "bg-card border border-border text-muted-foreground hover:border-gold/50"
            }`}
          >
            {subject === Subject.math ? "🔢 Math" : "📖 English"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3 max-w-sm mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !skillNodes || skillNodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="font-heading text-xl text-gold mb-2">No Skills Yet</h2>
          <p className="text-muted-foreground">
            Skill nodes will appear as you progress!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-sm mx-auto">
          {skillNodes.map((node) => {
            const status = getNodeStatus(
              node.id,
              node.requiredLevel,
              node.prerequisiteIds,
            );
            return (
              <div
                key={node.id}
                className={`rounded-2xl border-2 p-4 transition-all ${
                  status === "unlocked"
                    ? "border-emerald-500/60 bg-emerald-500/5"
                    : status === "available"
                      ? "border-gold/60 bg-gold/5"
                      : "border-border/40 bg-card/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      status === "unlocked"
                        ? "bg-emerald-500/20"
                        : status === "available"
                          ? "bg-gold/20"
                          : "bg-muted"
                    }`}
                  >
                    {status === "unlocked" ? (
                      <CheckCircle size={20} className="text-emerald-400" />
                    ) : status === "available" ? (
                      <Unlock size={20} className="text-gold" />
                    ) : (
                      <Lock size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-foreground">
                      {node.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Required Level: {Number(node.requiredLevel)}
                    </p>
                  </div>
                  {status === "available" && (
                    <RPGButton
                      variant="gold"
                      size="sm"
                      loading={unlockNode.isPending}
                      onClick={() => handleUnlock(node.id)}
                    >
                      Unlock
                    </RPGButton>
                  )}
                  {status === "unlocked" && (
                    <span className="text-xs text-emerald-400 font-bold">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {skillNodes && skillNodes.length > 0 && (
        <div className="mt-6 max-w-sm mx-auto bg-card border border-gold/20 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-heading font-bold text-emerald-400">
                {skillNodes.filter((n) => unlockedNodeIds.has(n.id)).length}
              </div>
              <div className="text-xs text-muted-foreground">Unlocked</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-gold">
                {
                  skillNodes.filter(
                    (n) =>
                      getNodeStatus(
                        n.id,
                        n.requiredLevel,
                        n.prerequisiteIds,
                      ) === "available",
                  ).length
                }
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-muted-foreground">
                {
                  skillNodes.filter(
                    (n) =>
                      getNodeStatus(
                        n.id,
                        n.requiredLevel,
                        n.prerequisiteIds,
                      ) === "locked",
                  ).length
                }
              </div>
              <div className="text-xs text-muted-foreground">Locked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
