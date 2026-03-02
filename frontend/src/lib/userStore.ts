// Simple store to persist userId across the session
const USER_ID_KEY = 'eduquest_user_id';

export function saveUserId(userId: string): void {
  try {
    localStorage.setItem(USER_ID_KEY, userId);
  } catch {
    // ignore
  }
}

export function loadUserId(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

export function clearUserId(): void {
  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch {
    // ignore
  }
}
