# Gamified Learning Platform

## Current State
The app has a DailyQuestsPage with a hardcoded QUEST_WORLD_MAP that maps 3 quest titles to world IDs:
- "Restore Letters" -> world1
- "Fix Sentences" -> world2
- "Math Rescue" -> world3

It also uses a single REQUIRED_LESSONS = 2 constant for all quests.

## Requested Changes (Diff)

### Add
- 4 quests total (combining previous version quests with new ones):
  1. Restore Letters — Alphabet Forest — Complete 2 lessons — 50 XP, 20 Coins
  2. Word Builder — Alphabet Forest — Complete 3 lessons — 60 XP, 25 Coins
  3. Grammar Fix — Grammar City — Complete 2 lessons — 70 XP, 30 Coins
  4. Math Rescue — Math Valley — Complete 2 lessons — 80 XP, 35 Coins

### Modify
- QUEST_WORLD_MAP to include all 4 quests mapped to correct worlds
- Quest progress tracking to use per-quest required lesson counts (not a single constant)
- World mappings:
  - Alphabet Forest -> world1
  - Grammar City -> world2
  - Math Valley -> world3

### Remove
- Old "Fix Sentences" quest entry (replaced by "Grammar Fix")
- Single REQUIRED_LESSONS constant (replaced by per-quest values)

## Implementation Plan
1. Update QUEST_WORLD_MAP in DailyQuestsPage.tsx to include all 4 quests
2. Add a QUEST_REQUIRED_LESSONS map keyed by quest title with per-quest values
3. Update getQuestProgress() to use per-quest required lesson count
4. Update "How Quests Work" info box to reflect variable lesson requirements
