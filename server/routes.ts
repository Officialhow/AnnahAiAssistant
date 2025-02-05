import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTaskSchema, insertEventSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Tasks API
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasks(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(req.user.id, parsed);
    res.json(task);
  });

  app.patch("/api/tasks/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const task = await storage.completeTask(req.user.id, parseInt(req.params.id));
    res.json(task);
  });

  // Events API 
  app.get("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const events = await storage.getEvents(req.user.id);
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertEventSchema.parse(req.body);
    const event = await storage.createEvent(req.user.id, parsed);
    res.json(event);
  });

  // WebSocket notifications
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Handle real-time notifications
      ws.send(JSON.stringify({ type: 'notification', message }));
    });
  });

  return httpServer;
}
