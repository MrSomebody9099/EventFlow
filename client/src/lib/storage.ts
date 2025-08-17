import type { User } from "@shared/schema";

const USER_STORAGE_KEY = "wedding-planner-user";

export function storeUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}
