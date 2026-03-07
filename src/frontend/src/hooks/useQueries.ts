import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Answer,
  Lesson,
  LessonProgressRecord,
  MultiplayerSession,
  Purchase,
  Quest,
  SkillNode,
  StreakRecord,
  TutorRecommendation,
  User,
  UserProfile,
  UserSkillNode,
  World,
} from "../backend";
import type { PurchaseType, Subject } from "../backend";
import { useActor } from "./useActor";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function useGetUser(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      age,
      avatarId,
    }: { username: string; age: bigint; avatarId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createUser(username, age, avatarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateUser(user);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
  });
}

// ─── Worlds ───────────────────────────────────────────────────────────────────

export function useListWorlds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<World[]>({
    queryKey: ["worlds"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listWorlds();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAvailableWorlds(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<World[]>({
    queryKey: ["availableWorlds", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAvailableWorlds(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export function useGetWorldLessons(worldId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lesson[]>({
    queryKey: ["worldLessons", worldId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getWorldLessons(worldId);
    },
    enabled: !!actor && !actorFetching && !!worldId,
  });
}

export function useGetLessonsByWorld(worldId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lesson[]>({
    queryKey: ["lessonsByWorld", worldId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getLessonsByWorld(worldId);
    },
    enabled: !!actor && !actorFetching && !!worldId,
  });
}

export function useRecordLessonResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      lessonId,
      score,
    }: { userId: string; lessonId: string; score: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordLessonResult(userId, lessonId, score);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
  });
}

// ─── Quests ───────────────────────────────────────────────────────────────────

export function useGetDailyQuests(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Quest[]>({
    queryKey: ["dailyQuests", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDailyQuests(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useCompleteQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      questId,
    }: { userId: string; questId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.completeQuest(userId, questId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dailyQuests", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
  });
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export function useGetSkillTree(subject: Subject) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SkillNode[]>({
    queryKey: ["skillTree", subject],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSkillTree(subject);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserSkillNodes(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserSkillNode[]>({
    queryKey: ["userSkillNodes", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserSkillNodes(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useUnlockSkillNode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      nodeId,
    }: { userId: string; nodeId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unlockSkillNode(userId, nodeId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userSkillNodes", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
  });
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export function useGetStreakStatus(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StreakRecord | null>({
    queryKey: ["streakStatus", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStreakStatus(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useRecordLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordLogin(userId);
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["streakStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}

export function useClaimStreakReward() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimStreakReward(userId);
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["streakStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}

// ─── Multiplayer ──────────────────────────────────────────────────────────────

export function useGetMultiplayerSession(sessionId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MultiplayerSession | null>({
    queryKey: ["multiplayerSession", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMultiplayerSession(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    refetchInterval: sessionId ? 3000 : false,
  });
}

export function useCreateChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hostId,
      subject,
    }: { hostId: string; subject: Subject }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createChallenge(hostId, subject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multiplayerSession"] });
    },
  });
}

export function useJoinChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      opponentId,
    }: { sessionId: string; opponentId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.joinChallenge(sessionId, opponentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["multiplayerSession", variables.sessionId],
      });
    },
  });
}

export function useSubmitAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      userId,
      answers,
    }: { sessionId: string; userId: string; answers: Answer[] }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitAnswers(sessionId, userId, answers);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["multiplayerSession", variables.sessionId],
      });
    },
  });
}

export function useResolveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.resolveSession(sessionId);
    },
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: ["multiplayerSession", sessionId],
      });
    },
  });
}

// ─── AI Tutor ─────────────────────────────────────────────────────────────────

export function useGetTutorRecommendation(userId: string, subject: Subject) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TutorRecommendation>({
    queryKey: ["tutorRecommendation", userId, subject],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTutorRecommendation(userId, subject);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// ─── Shop / Purchases ─────────────────────────────────────────────────────────

export function useGetUserPurchases(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Purchase[]>({
    queryKey: ["userPurchases", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserPurchases(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function usePurchaseItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      itemType,
      itemId,
    }: { userId: string; itemType: PurchaseType; itemId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.purchaseItem(userId, itemType, itemId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({
        queryKey: ["userPurchases", variables.userId],
      });
    },
  });
}

// ─── Progress Tracking ────────────────────────────────────────────────────────

export function useGetUserProgress(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LessonProgressRecord[]>({
    queryKey: ["userProgress", userId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserProgress(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetWorldProgress(userId: string, worldName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LessonProgressRecord[]>({
    queryKey: ["worldProgress", userId, worldName],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getWorldProgress(userId, worldName);
    },
    enabled: !!actor && !actorFetching && !!userId && !!worldName,
  });
}

export function useRecordProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      lessonName,
      worldName,
      score,
      xpEarned,
    }: {
      userId: string;
      lessonName: string;
      worldName: string;
      score: bigint;
      xpEarned: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordProgress(
        userId,
        lessonName,
        worldName,
        score,
        xpEarned,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userProgress", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["worldProgress", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
  });
}
