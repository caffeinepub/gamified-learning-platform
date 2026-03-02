import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserSkillNode {
    userId: string;
    unlocked: boolean;
    skillNodeId: string;
}
export interface StreakRecord {
    userId: string;
    longestStreak: bigint;
    lastStreakDate: bigint;
    currentStreak: bigint;
}
export interface User {
    id: string;
    xp: bigint;
    age: bigint;
    lastLoginDate: bigint;
    principal: Principal;
    username: string;
    gems: bigint;
    coins: bigint;
    streakDays: bigint;
    level: bigint;
    avatarId: string;
    currentWorldId: string;
    subjectProgress: Array<[Subject, bigint]>;
}
export interface SkillNode {
    id: string;
    subject: Subject;
    requiredLevel: bigint;
    name: string;
    prerequisiteIds: Array<string>;
}
export interface TutorRecommendation {
    recommendedLesson: string;
    hint: string;
    difficultyAdjustment: Difficulty;
}
export interface MultiplayerSession {
    id: string;
    status: SessionStatus;
    opponentId?: string;
    subject: Subject;
    winnerId?: string;
    hostId: string;
}
export interface Lesson {
    id: string;
    title: string;
    subject: Subject;
    xpReward: bigint;
    difficulty: Difficulty;
    coinReward: bigint;
    worldId: string;
    isBossBattle: boolean;
}
export interface Quest {
    id: string;
    title: string;
    expiresAt: bigint;
    xpReward: bigint;
    description: string;
    coinReward: bigint;
    isDaily: boolean;
}
export interface Answer {
    isCorrect: boolean;
    questionId: string;
}
export interface Purchase {
    id: string;
    itemId: string;
    purchaseDate: bigint;
    cost: bigint;
    userId: string;
    itemType: PurchaseType;
}
export interface World {
    id: string;
    subject: Subject;
    requiredLevel: bigint;
    difficulty: Difficulty;
    name: string;
    isUnlocked: boolean;
    bossDefeated: boolean;
}
export interface UserProfile {
    age: bigint;
    username: string;
    avatarId: string;
}
export enum Difficulty {
    mastery = "mastery",
    intermediate = "intermediate",
    elementary = "elementary",
    beginner = "beginner",
    advanced = "advanced",
    expert = "expert"
}
export enum PurchaseType {
    hintPack = "hintPack",
    worldSkin = "worldSkin",
    avatarCostume = "avatarCostume"
}
export enum SessionStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum Subject {
    math = "math",
    english = "english"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Claim streak reward for a user. Only the owning user may claim their reward.
     */
    claimStreakReward(userId: string): Promise<string>;
    /**
     * / Complete a quest for a user. Only the owning user may complete their quests.
     */
    completeQuest(userId: string, questId: string): Promise<void>;
    /**
     * / Create a multiplayer challenge. Only authenticated users may create challenges.
     */
    createChallenge(hostId: string, subject: Subject): Promise<string>;
    /**
     * / Create a lesson. Admin only.
     */
    createLesson(lesson: Lesson): Promise<string>;
    /**
     * / Create a quest. Admin only.
     */
    createQuest(quest: Quest): Promise<string>;
    /**
     * / Create a skill node. Admin only.
     */
    createSkillNode(skillNode: SkillNode): Promise<string>;
    /**
     * / Create a new game user record for the caller.
     * / Requires the caller to be an authenticated user (not a guest).
     */
    createUser(username: string, age: bigint, avatarId: string): Promise<string>;
    /**
     * / Create a world. Admin only.
     */
    createWorld(world: World): Promise<string>;
    /**
     * / Delete a lesson. Admin only.
     */
    deleteLesson(id: string): Promise<void>;
    /**
     * / Delete a quest. Admin only.
     */
    deleteQuest(id: string): Promise<void>;
    /**
     * / Delete a skill node. Admin only.
     */
    deleteSkillNode(id: string): Promise<void>;
    /**
     * / Delete a user record. Only the owning principal or an admin may delete it.
     */
    deleteUser(id: string): Promise<void>;
    /**
     * / Delete a world. Admin only.
     */
    deleteWorld(id: string): Promise<void>;
    /**
     * / Get the caller's own profile.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get daily quests for a user. Only the owning user or an admin may call this.
     */
    getDailyQuests(userId: string): Promise<Array<Quest>>;
    /**
     * / Read a lesson. Any authenticated user may read lesson data.
     */
    getLesson(id: string): Promise<Lesson | null>;
    /**
     * / List lessons for a specific world. Any authenticated user may call this.
     */
    getLessonsByWorld(worldId: string): Promise<Array<Lesson>>;
    /**
     * / Get a multiplayer session. Participants or admins only.
     */
    getMultiplayerSession(sessionId: string): Promise<MultiplayerSession | null>;
    /**
     * / Read a quest. Any authenticated user may read quest data.
     */
    getQuest(id: string): Promise<Quest | null>;
    /**
     * / Read a skill node. Any authenticated user may read skill node data.
     */
    getSkillNode(id: string): Promise<SkillNode | null>;
    /**
     * / Get all skill nodes for a subject. Any authenticated user may call this.
     */
    getSkillTree(subject: Subject): Promise<Array<SkillNode>>;
    /**
     * / Get streak status for a user. Only the owning user or an admin may call this.
     */
    getStreakStatus(userId: string): Promise<StreakRecord | null>;
    /**
     * / Get a tutor recommendation for a user. Only the owning user or an admin may call this.
     */
    getTutorRecommendation(userId: string, subject: Subject): Promise<TutorRecommendation>;
    /**
     * / Retrieve a user record. Only the owning principal or an admin may read it.
     */
    getUser(id: string): Promise<User | null>;
    /**
     * / Fetch another user's profile. Callers may only view their own profile
     * / unless they are an admin.
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Get all purchases for a user. Only the owning user or an admin may call this.
     */
    getUserPurchases(userId: string): Promise<Array<Purchase>>;
    /**
     * / Get all skill nodes unlocked by a user. Only the owning user or an admin may call this.
     */
    getUserSkillNodes(userId: string): Promise<Array<UserSkillNode>>;
    /**
     * / Read a world. Any authenticated user may read world data.
     */
    getWorld(id: string): Promise<World | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Join a multiplayer challenge. Only authenticated users may join challenges.
     */
    joinChallenge(sessionId: string, opponentId: string): Promise<void>;
    /**
     * / List all lessons. Any authenticated user may list lessons.
     */
    listLessons(): Promise<Array<Lesson>>;
    /**
     * / List all worlds. Any authenticated user may list worlds.
     */
    listWorlds(): Promise<Array<World>>;
    /**
     * / Purchase an item from the shop. Only the owning user may make purchases.
     */
    purchaseItem(userId: string, itemType: PurchaseType, itemId: string): Promise<string>;
    /**
     * / Record a lesson result for a user. Only the owning user may record their results.
     */
    recordLessonResult(userId: string, lessonId: string, score: bigint): Promise<void>;
    /**
     * / Record a daily login for a user. Only the owning user may record their login.
     */
    recordLogin(userId: string): Promise<void>;
    /**
     * / Resolve a multiplayer session. Only authenticated users (participants) or admins may resolve.
     */
    resolveSession(sessionId: string): Promise<void>;
    /**
     * / Save / update the caller's own profile.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Submit answers for a multiplayer session. Only the participating user may submit.
     */
    submitAnswers(sessionId: string, userId: string, answers: Array<Answer>): Promise<void>;
    /**
     * / Unlock a skill node for a user. Only the owning user may unlock their nodes.
     */
    unlockSkillNode(userId: string, nodeId: string): Promise<void>;
    /**
     * / Update a lesson. Admin only.
     */
    updateLesson(lesson: Lesson): Promise<void>;
    /**
     * / Update a quest. Admin only.
     */
    updateQuest(quest: Quest): Promise<void>;
    /**
     * / Update a skill node. Admin only.
     */
    updateSkillNode(skillNode: SkillNode): Promise<void>;
    /**
     * / Update a user record. Only the owning principal or an admin may update it.
     */
    updateUser(user: User): Promise<void>;
    /**
     * / Update a world. Admin only.
     */
    updateWorld(world: World): Promise<void>;
}
