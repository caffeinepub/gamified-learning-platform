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
export interface LessonProgressRecord {
    id: string;
    userId: string;
    completed: boolean;
    worldName: string;
    dateCompleted: bigint;
    score: bigint;
    lessonName: string;
    xpEarned: bigint;
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
    question: string;
    subject: Subject;
    xpReward: bigint;
    difficulty: Difficulty;
    correctAnswer: string;
    coinReward: bigint;
    worldId: string;
    isBossBattle: boolean;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
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
    order: bigint;
    difficulty: Difficulty;
    name: string;
    unlockXp: bigint;
    description: string;
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
    claimStreakReward(userId: string): Promise<string>;
    completeQuest(userId: string, questId: string): Promise<void>;
    createChallenge(hostId: string, subject: Subject): Promise<string>;
    createLesson(lesson: Lesson): Promise<string>;
    createQuest(quest: Quest): Promise<string>;
    createSkillNode(skillNode: SkillNode): Promise<string>;
    createUser(username: string, age: bigint, avatarId: string): Promise<string>;
    deleteLesson(id: string): Promise<void>;
    deleteQuest(id: string): Promise<void>;
    deleteSkillNode(id: string): Promise<void>;
    deleteUser(id: string): Promise<void>;
    getAvailableWorlds(userId: string): Promise<Array<World>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyQuests(userId: string): Promise<Array<Quest>>;
    getLesson(id: string): Promise<Lesson | null>;
    getLessonsByWorld(worldId: string): Promise<Array<Lesson>>;
    getMultiplayerSession(sessionId: string): Promise<MultiplayerSession | null>;
    getQuest(id: string): Promise<Quest | null>;
    getSkillNode(id: string): Promise<SkillNode | null>;
    getSkillTree(subject: Subject): Promise<Array<SkillNode>>;
    getStreakStatus(userId: string): Promise<StreakRecord | null>;
    getTutorRecommendation(userId: string, subject: Subject): Promise<TutorRecommendation>;
    getUser(id: string): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProgress(userId: string): Promise<Array<LessonProgressRecord>>;
    getUserPurchases(userId: string): Promise<Array<Purchase>>;
    getUserSkillNodes(userId: string): Promise<Array<UserSkillNode>>;
    getWorld(id: string): Promise<World | null>;
    getWorldLessons(worldId: string): Promise<Array<Lesson>>;
    getWorldProgress(userId: string, worldName: string): Promise<Array<LessonProgressRecord>>;
    isCallerAdmin(): Promise<boolean>;
    joinChallenge(sessionId: string, opponentId: string): Promise<void>;
    listLessons(): Promise<Array<Lesson>>;
    listWorlds(): Promise<Array<World>>;
    purchaseItem(userId: string, itemType: PurchaseType, itemId: string): Promise<string>;
    recordLessonResult(userId: string, lessonId: string, score: bigint): Promise<void>;
    recordLogin(userId: string): Promise<void>;
    recordProgress(userId: string, lessonName: string, worldName: string, score: bigint, xpEarned: bigint): Promise<string>;
    resolveSession(sessionId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAnswers(sessionId: string, userId: string, answers: Array<Answer>): Promise<void>;
    unlockSkillNode(userId: string, nodeId: string): Promise<void>;
    updateLesson(lesson: Lesson): Promise<void>;
    updateQuest(quest: Quest): Promise<void>;
    updateSkillNode(skillNode: SkillNode): Promise<void>;
    updateUser(user: User): Promise<void>;
}
