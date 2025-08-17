import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertExpenseSchema, insertVendorSchema, insertGuestSchema, insertTaskSchema, insertInspirationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Expense routes
  app.get("/api/users/:userId/expenses", async (req, res) => {
    const expenses = await storage.getExpenses(req.params.userId);
    res.json(expenses);
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data", error });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    const deleted = await storage.deleteExpense(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted" });
  });

  // Vendor routes
  app.get("/api/users/:userId/vendors", async (req, res) => {
    const vendors = await storage.getVendors(req.params.userId);
    res.json(vendors);
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Invalid vendor data", error });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(req.params.id, vendorData);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Invalid vendor data", error });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    const deleted = await storage.deleteVendor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor deleted" });
  });

  // Guest routes
  app.get("/api/users/:userId/guests", async (req, res) => {
    const guests = await storage.getGuests(req.params.userId);
    res.json(guests);
  });

  app.post("/api/guests", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data", error });
    }
  });

  app.put("/api/guests/:id", async (req, res) => {
    try {
      const guestData = insertGuestSchema.partial().parse(req.body);
      const guest = await storage.updateGuest(req.params.id, guestData);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data", error });
    }
  });

  app.delete("/api/guests/:id", async (req, res) => {
    const deleted = await storage.deleteGuest(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Guest not found" });
    }
    res.json({ message: "Guest deleted" });
  });

  // Task routes
  app.get("/api/users/:userId/tasks", async (req, res) => {
    const tasks = await storage.getTasks(req.params.userId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const deleted = await storage.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  });

  // Inspiration routes
  app.get("/api/users/:userId/inspirations", async (req, res) => {
    const inspirations = await storage.getInspirations(req.params.userId);
    res.json(inspirations);
  });

  app.post("/api/inspirations", async (req, res) => {
    try {
      const inspirationData = insertInspirationSchema.parse(req.body);
      const inspiration = await storage.createInspiration(inspirationData);
      res.json(inspiration);
    } catch (error) {
      res.status(400).json({ message: "Invalid inspiration data", error });
    }
  });

  app.delete("/api/inspirations/:id", async (req, res) => {
    const deleted = await storage.deleteInspiration(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Inspiration not found" });
    }
    res.json({ message: "Inspiration deleted" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
