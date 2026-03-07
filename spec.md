# Gamified Learning Platform

## Current State
The app has a World Map → World Detail → Lesson flow. When all lessons in a world are completed (`onComplete` is called), the app simply navigates back to the World Map with no fanfare. XP and level-up animations play mid-lesson (per question) but there is no end-of-world results screen. The "next world unlock" state is not communicated after finishing.

## Requested Changes (Diff)

### Add
- **LessonResultsPage**: A full-screen results/celebration screen that appears after completing all lessons in a world. Shows:
  - Total XP earned in the session, total score (correct/total)
  - Level-up celebration if the player levelled up during the session
  - "Next World Unlocked!" banner if completing this world unlocks the next one (based on user XP vs next world's unlockXp)
  - Three CTAs: "Continue to Next World" (if unlocked), "Replay World", "Back to Map"
- **Navigation hook**: `onComplete` in `LessonPage` now passes session summary data (totalXP, score, totalQuestions, newLevel, unlockedNextWorldId) to the parent so App.tsx can render the results page.

### Modify
- **LessonPage**: Collect session totals (xpGained accumulated across all correct answers, score, totalAnswered). On final question submit, pass these stats to `onComplete` via a callback signature change: `onComplete(stats: LessonSessionStats)`.
- **App.tsx**: Store lesson session stats in state. When `onComplete` is called, navigate to the new `"results"` page instead of directly to `"worldmap"`. Pass world context and session stats to results page.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `LessonSessionStats` type and update `LessonPage` `onComplete` prop signature to pass stats.
2. Accumulate `totalXPEarned` across all correct answers in `LessonPage`; pass final stats on completion.
3. Create `src/frontend/src/pages/LessonResultsPage.tsx` with the celebration UI.
4. Add `"results"` to the `AppPage` union in `App.tsx`; add state for session stats; wire `onComplete` → results page; wire results page CTAs back to worldmap/worlddetail/lesson.
