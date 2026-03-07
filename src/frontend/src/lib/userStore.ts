const USER_ID_KEY = "eduquest_user_id";
const LESSON_PROGRESS_KEY = "eduquest_lesson_progress";

export function saveUserId(userId: string): void {
  localStorage.setItem(USER_ID_KEY, userId);
}

export function loadUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

export function recordLessonCompletion(worldId: string): void {
  const progress = loadLessonProgress();
  const current = progress[worldId] || 0;
  progress[worldId] = current + 1;
  localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress));
}

export function getCompletedLessonCount(worldId: string): number {
  const progress = loadLessonProgress();
  return progress[worldId] || 0;
}

export function loadLessonProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LESSON_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearLessonProgress(): void {
  localStorage.removeItem(LESSON_PROGRESS_KEY);
}
