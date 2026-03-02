# Specification

## Summary
**Goal:** Build EduQuest Academy — a full-stack gamified Math & English learning platform with RPG-style progression, covering ages 6–18+.

**Planned changes:**

**Backend (Motoko actor):**
- Define data models: User, World, Lesson, Quest, UserQuest, StreakRecord, MultiplayerSession, SkillNode, UserSkillNode with stable variables
- CRUD and query functions for all entities
- XP/level-up logic (1000 XP = 1 level), coin/gem balance tracking
- Seed 12 worlds (6 Math, 6 English) across difficulty tiers (Beginner→Mastery), each with 5+ regular lessons and 1 boss lesson (3x XP)
- Skill tree system: 15+ nodes per subject (DAG), with `getSkillTree`, `unlockSkillNode`, `getUserSkillNodes` enforcing level and prerequisite requirements
- Daily Quests system: 3 quests/user/day (expire midnight UTC), types include lesson completion, boss defeat, streak maintenance, multiplayer win; `getDailyQuests`, `completeQuest`
- Streak Rewards: consecutive login tracking, milestone rewards at days 3/7/14/30 (coins, gems, avatar frame, world skin); `recordLogin`, `getStreakStatus`, `claimStreakReward`
- Multiplayer Competitions: async turn-based quiz (10 questions, 90s), winner gets 150 XP + 50 coins, loser gets 30 XP; `createChallenge`, `joinChallenge`, `submitAnswers`, `resolveSession`
- Rule-based AI Tutor: tracks error patterns, recommends remedial lesson if score <60%, advances if >90%; `getTutorRecommendation`, `recordLessonResult`
- Shop backend: deduct coins/gems for hint packs, avatar costumes, world skins; track ownership

**Frontend (React):**
- Splash/Onboarding screen: character selection (4 avatars) and age-group selection
- World Map screen: 12 worlds as visual nodes on adventure map with locked/unlocked/boss states and themed zone backgrounds
- Lesson screen: multiple choice and fill-in-the-blank questions, one at a time, with immediate feedback (green flash + XP pop-up for correct, red shake + hint for wrong)
- Skill Tree screen: visual node graph with prerequisite lines per subject
- Daily Quests panel: progress bars per active quest
- Streak tracker: fire icon with day count and milestone markers
- Multiplayer lobby and battle screen: list challenges, create challenge button
- AI Tutor panel: recommendation display with motivational message
- Profile screen: animated XP bar, level, coin/gem balances, avatar, achievements
- Leaderboard screen: top 10 users by XP with rank badges
- Shop screen: hint packs (50 coins), premium avatar costumes (20 gems), world skins (30 gems)
- Persistent header showing coin and gem balances on all screens
- Bottom navigation bar linking all screens
- RPG visual theme: jewel-toned palette (emerald, gold, crimson, midnight navy), bold rounded headings, animated XP gains, level-up celebration, coin/gem sparkle, boss battle dramatic entrance, 3D-press buttons, particle effects

**User-visible outcome:** Users can register with a character and age group, progress through 12 RPG-themed worlds of Math and English lessons, build skill trees, complete daily quests, maintain streaks for rewards, challenge others to multiplayer quizzes, receive adaptive tutor recommendations, and customize avatars via the shop — all within a vibrant console-RPG-inspired interface.
