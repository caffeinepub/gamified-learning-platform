import React, { useState } from 'react';
import { useGetSkillTree, useGetUserSkillNodes, useUnlockSkillNode, useGetUser } from '@/hooks/useQueries';
import { loadUserId } from '@/lib/userStore';
import { Subject, type SkillNode } from '@/backend';
import { Lock, Unlock, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import RPGButton from '@/components/RPGButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function SkillNodeCard({
  node,
  status,
  onUnlock,
  isUnlocking,
}: {
  node: SkillNode;
  status: 'locked' | 'available' | 'unlocked';
  onUnlock: () => void;
  isUnlocking: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const colors = {
    locked: {
      border: 'oklch(0.3 0.04 265)',
      bg: 'oklch(0.18 0.03 265)',
      text: 'oklch(0.45 0.04 265)',
    },
    available: {
      border: 'oklch(0.78 0.16 85 / 0.6)',
      bg: 'oklch(0.2 0.05 265)',
      text: 'oklch(0.88 0.14 85)',
    },
    unlocked: {
      border: 'oklch(0.55 0.18 155 / 0.6)',
      bg: 'oklch(0.18 0.06 155)',
      text: 'oklch(0.62 0.2 155)',
    },
  };

  const c = colors[status];

  return (
    <div
      className="rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer"
      style={{ borderColor: c.border, background: c.bg }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background:
              status === 'unlocked'
                ? 'oklch(0.55 0.18 155 / 0.3)'
                : status === 'available'
                ? 'oklch(0.78 0.16 85 / 0.2)'
                : 'oklch(0.22 0.04 265)',
            border: `2px solid ${c.border}`,
          }}
        >
          {status === 'unlocked' ? (
            <CheckCircle size={18} style={{ color: 'oklch(0.62 0.2 155)' }} />
          ) : status === 'available' ? (
            <Unlock size={18} style={{ color: 'oklch(0.78 0.16 85)' }} />
          ) : (
            <Lock size={18} style={{ color: 'oklch(0.45 0.04 265)' }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm truncate" style={{ color: c.text }}>
            {node.name}
          </p>
          <p className="text-xs font-body text-muted-foreground">
            Req. Level {Number(node.requiredLevel)}
          </p>
        </div>
        <ChevronRight
          size={16}
          className={cn('text-muted-foreground transition-transform', expanded && 'rotate-90')}
        />
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-3">
          {node.prerequisiteIds.length > 0 && (
            <p className="text-xs font-body text-muted-foreground">
              Prerequisites: {node.prerequisiteIds.length} node(s) required
            </p>
          )}
          {status === 'available' && (
            <RPGButton
              variant="gold"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUnlock();
              }}
              loading={isUnlocking}
              className="w-full"
            >
              🔓 Unlock Node
            </RPGButton>
          )}
          {status === 'locked' && (
            <p className="text-xs font-body text-center" style={{ color: 'oklch(0.58 0.22 27)' }}>
              🔒 Level {Number(node.requiredLevel)} required
            </p>
          )}
          {status === 'unlocked' && (
            <p className="text-xs font-body text-center" style={{ color: 'oklch(0.62 0.2 155)' }}>
              ✅ Skill Mastered!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SubjectSkillTree({ subject, userId }: { subject: Subject; userId: string | null }) {
  const { data: nodes = [], isLoading } = useGetSkillTree(subject);
  const { data: userNodes = [] } = useGetUserSkillNodes(userId);
  const { data: user } = useGetUser(userId);
  const unlockNode = useUnlockSkillNode();
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const userLevel = user ? Number(user.level) : 1;
  const unlockedIds = new Set(userNodes.filter((n) => n.unlocked).map((n) => n.skillNodeId));

  const getStatus = (node: SkillNode): 'locked' | 'available' | 'unlocked' => {
    if (unlockedIds.has(node.id)) return 'unlocked';
    const levelOk = userLevel >= Number(node.requiredLevel);
    const prereqsOk = node.prerequisiteIds.every((pid) => unlockedIds.has(pid));
    if (levelOk && prereqsOk) return 'available';
    return 'locked';
  };

  const handleUnlock = async (nodeId: string) => {
    if (!userId) return;
    setUnlockingId(nodeId);
    try {
      await unlockNode.mutateAsync({ userId, nodeId });
      toast.success('Skill node unlocked! 🎉');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes('trap') ? 'Cannot unlock this node yet.' : msg);
    } finally {
      setUnlockingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: 'oklch(0.78 0.16 85)', borderTopColor: 'transparent' }}
        />
        <p className="text-muted-foreground font-body text-sm">Loading skill tree...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rpg-card text-center py-8 mt-4">
        <p className="font-heading text-xl mb-2" style={{ color: 'oklch(0.88 0.14 85)' }}>
          No Skills Yet
        </p>
        <p className="text-muted-foreground font-body text-sm">
          The skill tree for this subject hasn't been set up yet.
        </p>
      </div>
    );
  }

  const unlocked = nodes.filter((n) => getStatus(n) === 'unlocked');
  const available = nodes.filter((n) => getStatus(n) === 'available');
  const locked = nodes.filter((n) => getStatus(n) === 'locked');

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Progress summary */}
      <div
        className="rpg-card flex items-center justify-between"
        style={{ borderColor: 'oklch(0.55 0.18 155 / 0.4)' }}
      >
        <div className="text-center">
          <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.62 0.2 155)' }}>
            {unlocked.length}
          </p>
          <p className="text-xs font-body text-muted-foreground">Unlocked</p>
        </div>
        <div className="text-center">
          <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.88 0.14 85)' }}>
            {available.length}
          </p>
          <p className="text-xs font-body text-muted-foreground">Available</p>
        </div>
        <div className="text-center">
          <p className="font-heading text-2xl font-bold text-muted-foreground">{locked.length}</p>
          <p className="text-xs font-body text-muted-foreground">Locked</p>
        </div>
        <div className="text-center">
          <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.65 0.15 220)' }}>
            {nodes.length}
          </p>
          <p className="text-xs font-body text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Available nodes first */}
      {available.length > 0 && (
        <div>
          <p
            className="font-heading text-sm font-bold mb-2 px-1"
            style={{ color: 'oklch(0.88 0.14 85)' }}
          >
            ✨ Available to Unlock
          </p>
          <div className="flex flex-col gap-2">
            {available.map((node) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                status="available"
                onUnlock={() => handleUnlock(node.id)}
                isUnlocking={unlockingId === node.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unlocked nodes */}
      {unlocked.length > 0 && (
        <div>
          <p
            className="font-heading text-sm font-bold mb-2 px-1"
            style={{ color: 'oklch(0.62 0.2 155)' }}
          >
            ✅ Mastered Skills
          </p>
          <div className="flex flex-col gap-2">
            {unlocked.map((node) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                status="unlocked"
                onUnlock={() => {}}
                isUnlocking={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked nodes */}
      {locked.length > 0 && (
        <div>
          <p className="font-heading text-sm font-bold mb-2 px-1 text-muted-foreground">
            🔒 Locked Skills
          </p>
          <div className="flex flex-col gap-2">
            {locked.map((node) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                status="locked"
                onUnlock={() => {}}
                isUnlocking={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillTreePage() {
  const userId = loadUserId();

  return (
    <div className="px-4 py-6">
      <Toaster />
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: 'oklch(0.88 0.14 85)' }}>
          🌳 Skill Tree
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Unlock skills to power up your learning journey
        </p>
      </div>

      <Tabs defaultValue="math">
        <TabsList
          className="w-full mb-4"
          style={{ background: 'oklch(0.18 0.04 265)', border: '1px solid oklch(0.3 0.05 265)' }}
        >
          <TabsTrigger value="math" className="flex-1 font-heading font-bold">
            🔢 Math
          </TabsTrigger>
          <TabsTrigger value="english" className="flex-1 font-heading font-bold">
            📚 English
          </TabsTrigger>
        </TabsList>
        <TabsContent value="math">
          <SubjectSkillTree subject={Subject.math} userId={userId} />
        </TabsContent>
        <TabsContent value="english">
          <SubjectSkillTree subject={Subject.english} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
