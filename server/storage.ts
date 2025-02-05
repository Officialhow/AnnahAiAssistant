import { users, tasks, events, type User, type InsertUser, type Task, type InsertTask, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  completeTask(userId: number, taskId: number): Promise<Task>;

  // Event methods
  getEvents(userId: number): Promise<Event[]>;
  createEvent(userId: number, event: InsertEvent): Promise<Event>;

  // Session store for auth
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async createTask(userId: number, task: InsertTask): Promise<Task> {
    const taskData = {
      ...task,
      userId,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    };

    const [newTask] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return newTask;
  }

  async completeTask(userId: number, taskId: number): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ completed: true })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }

  async getEvents(userId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.userId, userId));
  }

  async createEvent(userId: number, event: InsertEvent): Promise<Event> {
    const eventData = {
      ...event,
      userId,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    };

    const [newEvent] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return newEvent;
  }
}

export const storage = new DatabaseStorage();