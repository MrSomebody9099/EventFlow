import { 
  type User, type InsertUser,
  type Expense, type InsertExpense,
  type Vendor, type InsertVendor,
  type Guest, type InsertGuest,
  type Task, type InsertTask,
  type Inspiration, type InsertInspiration
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Expense operations
  getExpenses(userId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<boolean>;

  // Vendor operations
  getVendors(userId: string): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;

  // Guest operations
  getGuests(userId: string): Promise<Guest[]>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: string): Promise<boolean>;

  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Inspiration operations
  getInspirations(userId: string): Promise<Inspiration[]>;
  createInspiration(inspiration: InsertInspiration): Promise<Inspiration>;
  deleteInspiration(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private guests: Map<string, Guest> = new Map();
  private tasks: Map<string, Task> = new Map();
  private inspirations: Map<string, Inspiration> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Expense operations
  async getExpenses(userId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.userId === userId);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      date: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Vendor operations
  async getVendors(userId: string): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(vendor => vendor.userId === userId);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const vendor: Vendor = { ...insertVendor, id };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: string, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...updateData };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Guest operations
  async getGuests(userId: string): Promise<Guest[]> {
    return Array.from(this.guests.values()).filter(guest => guest.userId === userId);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = randomUUID();
    const guest: Guest = { ...insertGuest, id };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: string, updateData: Partial<InsertGuest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;
    
    const updatedGuest = { ...guest, ...updateData };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  async deleteGuest(id: string): Promise<boolean> {
    return this.guests.delete(id);
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Inspiration operations
  async getInspirations(userId: string): Promise<Inspiration[]> {
    return Array.from(this.inspirations.values()).filter(inspiration => inspiration.userId === userId);
  }

  async createInspiration(insertInspiration: InsertInspiration): Promise<Inspiration> {
    const id = randomUUID();
    const inspiration: Inspiration = { ...insertInspiration, id };
    this.inspirations.set(id, inspiration);
    return inspiration;
  }

  async deleteInspiration(id: string): Promise<boolean> {
    return this.inspirations.delete(id);
  }
}

export const storage = new MemStorage();
