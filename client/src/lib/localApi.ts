import { nanoid } from "nanoid";
import type {
  User,
  InsertUser,
  Expense,
  InsertExpense,
  Vendor,
  InsertVendor,
  Guest,
  InsertGuest,
  Task,
  InsertTask,
  Inspiration,
  InsertInspiration,
} from "@shared/schema";

type CollectionName = "users" | "expenses" | "vendors" | "guests" | "tasks" | "inspirations";

const LS_KEY_PREFIX = "eventflow-localapi";

function getKey(name: CollectionName): string {
  return `${LS_KEY_PREFIX}:${name}`;
}

function readCollection<T>(name: CollectionName): T[] {
  try {
    const raw = localStorage.getItem(getKey(name));
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(name: CollectionName, items: T[]): void {
  localStorage.setItem(getKey(name), JSON.stringify(items));
}

export const localApi = {
  // Users
  async createUser(data: InsertUser): Promise<User> {
    const users = readCollection<User>("users");
    const user: User = {
      ...(data as unknown as User),
      id: nanoid(),
      createdAt: new Date() as unknown as any,
    };
    users.push(user);
    writeCollection("users", users);
    return user;
  },
  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const users = readCollection<User>("users");
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...(data as any) };
    writeCollection("users", users);
    return users[idx];
  },
  async getUser(id: string): Promise<User> {
    const users = readCollection<User>("users");
    const user = users.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    return user;
  },

  // Expenses
  async listExpenses(userId: string): Promise<Expense[]> {
    return readCollection<Expense>("expenses").filter(e => e.userId === userId);
  },
  async createExpense(data: InsertExpense): Promise<Expense> {
    const items = readCollection<Expense>("expenses");
    const expense: Expense = { ...(data as any), id: nanoid(), date: new Date() as unknown as any };
    items.push(expense);
    writeCollection("expenses", items);
    return expense;
  },
  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense> {
    const items = readCollection<Expense>("expenses");
    const idx = items.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("Expense not found");
    items[idx] = { ...items[idx], ...(data as any) };
    writeCollection("expenses", items);
    return items[idx];
  },
  async deleteExpense(id: string): Promise<void> {
    const items = readCollection<Expense>("expenses");
    writeCollection("expenses", items.filter(e => e.id !== id));
  },

  // Vendors
  async listVendors(userId: string): Promise<Vendor[]> {
    return readCollection<Vendor>("vendors").filter(v => v.userId === userId);
  },
  async createVendor(data: InsertVendor): Promise<Vendor> {
    const items = readCollection<Vendor>("vendors");
    const vendor: Vendor = { ...(data as any), id: nanoid() };
    items.push(vendor);
    writeCollection("vendors", items);
    return vendor;
  },
  async updateVendor(id: string, data: Partial<InsertVendor>): Promise<Vendor> {
    const items = readCollection<Vendor>("vendors");
    const idx = items.findIndex(v => v.id === id);
    if (idx === -1) throw new Error("Vendor not found");
    items[idx] = { ...items[idx], ...(data as any) };
    writeCollection("vendors", items);
    return items[idx];
  },
  async deleteVendor(id: string): Promise<void> {
    const items = readCollection<Vendor>("vendors");
    writeCollection("vendors", items.filter(v => v.id !== id));
  },

  // Guests
  async listGuests(userId: string): Promise<Guest[]> {
    return readCollection<Guest>("guests").filter(g => g.userId === userId);
  },
  async createGuest(data: InsertGuest): Promise<Guest> {
    const items = readCollection<Guest>("guests");
    const guest: Guest = { ...(data as any), id: nanoid() };
    items.push(guest);
    writeCollection("guests", items);
    return guest;
  },
  async updateGuest(id: string, data: Partial<InsertGuest>): Promise<Guest> {
    const items = readCollection<Guest>("guests");
    const idx = items.findIndex(g => g.id === id);
    if (idx === -1) throw new Error("Guest not found");
    items[idx] = { ...items[idx], ...(data as any) };
    writeCollection("guests", items);
    return items[idx];
  },
  async deleteGuest(id: string): Promise<void> {
    const items = readCollection<Guest>("guests");
    writeCollection("guests", items.filter(g => g.id !== id));
  },

  // Tasks
  async listTasks(userId: string): Promise<Task[]> {
    return readCollection<Task>("tasks").filter(t => t.userId === userId);
  },
  async createTask(data: InsertTask): Promise<Task> {
    const items = readCollection<Task>("tasks");
    const task: Task = { ...(data as any), id: nanoid() };
    items.push(task);
    writeCollection("tasks", items);
    return task;
  },
  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task> {
    const items = readCollection<Task>("tasks");
    const idx = items.findIndex(t => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    items[idx] = { ...items[idx], ...(data as any) };
    writeCollection("tasks", items);
    return items[idx];
  },
  async deleteTask(id: string): Promise<void> {
    const items = readCollection<Task>("tasks");
    writeCollection("tasks", items.filter(t => t.id !== id));
  },

  // Inspirations
  async listInspirations(userId: string): Promise<Inspiration[]> {
    return readCollection<Inspiration>("inspirations").filter(i => i.userId === userId);
  },
  async createInspiration(data: InsertInspiration): Promise<Inspiration> {
    const items = readCollection<Inspiration>("inspirations");
    const inspiration: Inspiration = { ...(data as any), id: nanoid() };
    items.push(inspiration);
    writeCollection("inspirations", items);
    return inspiration;
  },
  async deleteInspiration(id: string): Promise<void> {
    const items = readCollection<Inspiration>("inspirations");
    writeCollection("inspirations", items.filter(i => i.id !== id));
  },
};

export function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get("Content-Type") || res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

export function shouldFallback(res: Response): boolean {
  if (!res.ok) return true;
  return !isJsonResponse(res);
}


