import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Subject, PurchaseType, type UserProfile, type Answer } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── User ──────────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, age, avatarId }: { username: string; age: bigint; avatarId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(username, age, avatarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUser(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

// ── Worlds ────────────────────────────────────────────────────────────────────

export function useListWorlds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['worlds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listWorlds();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export function useGetLessonsByWorld(worldId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['lessons', worldId],
    queryFn: async () => {
      if (!actor || !worldId) return [];
      return actor.getLessonsByWorld(worldId);
    },
    enabled: !!actor && !actorFetching && !!worldId,
    staleTime: 60_000,
  });
}

export function useListLessons() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLessons();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

export function useRecordLessonResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, lessonId, score }: { userId: string; lessonId: string; score: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordLessonResult(userId, lessonId, score);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
}

// ── Skill Tree ────────────────────────────────────────────────────────────────

export function useGetSkillTree(subject: Subject) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['skillTree', subject],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSkillTree(subject);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 120_000,
  });
}

export function useGetUserSkillNodes(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['userSkillNodes', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserSkillNodes(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function useUnlockSkillNode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, nodeId }: { userId: string; nodeId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlockSkillNode(userId, nodeId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userSkillNodes', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
}

// ── Daily Quests ──────────────────────────────────────────────────────────────

export function useGetDailyQuests(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['dailyQuests', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getDailyQuests(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 60_000,
  });
}

export function useCompleteQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, questId }: { userId: string; questId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeQuest(userId, questId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyQuests', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
}

// ── Streak ────────────────────────────────────────────────────────────────────

export function useGetStreakStatus(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['streakStatus', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getStreakStatus(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function useRecordLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordLogin(userId);
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['streakStatus', userId] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

export function useClaimStreakReward() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimStreakReward(userId);
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['streakStatus', userId] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

// ── Multiplayer ───────────────────────────────────────────────────────────────

export function useGetMultiplayerSession(sessionId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['multiplayerSession', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getMultiplayerSession(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    staleTime: 5_000,
    refetchInterval: 5_000,
  });
}

export function useCreateChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hostId, subject }: { hostId: string; subject: Subject }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createChallenge(hostId, subject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiplayerSession'] });
    },
  });
}

export function useJoinChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, opponentId }: { sessionId: string; opponentId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinChallenge(sessionId, opponentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['multiplayerSession', variables.sessionId] });
    },
  });
}

export function useSubmitAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, userId, answers }: { sessionId: string; userId: string; answers: Answer[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAnswers(sessionId, userId, answers);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['multiplayerSession', variables.sessionId] });
    },
  });
}

export function useResolveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resolveSession(sessionId);
    },
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['multiplayerSession', sessionId] });
    },
  });
}

// ── AI Tutor ──────────────────────────────────────────────────────────────────

export function useGetTutorRecommendation(userId: string | null, subject: Subject) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['tutorRecommendation', userId, subject],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getTutorRecommendation(userId, subject);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

// ── Shop / Purchases ──────────────────────────────────────────────────────────

export function useGetUserPurchases(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['userPurchases', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserPurchases(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function usePurchaseItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, itemType, itemId }: { userId: string; itemType: PurchaseType; itemId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseItem(userId, itemType, itemId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPurchases', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
}
