import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTaskSchema, insertEventSchema } from "@shared/schema";

const wsClients = new Set<WebSocket>();

function checkUpcomingTasks() {
  setInterval(async () => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

    for (const ws of wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        const tasks = await storage.getAllTasks();
        const upcomingTasks = tasks.filter(task => {
          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            return dueDate > now && dueDate <= thirtyMinutesFromNow && !task.completed;
          }
          return false;
        });

        for (const task of upcomingTasks) {
          ws.send(JSON.stringify({
            type: 'notification',
            message: `Task "${task.title}" is due in less than 30 minutes`,
            showBrowserNotification: true
          }));
        }
      }
    }
  }, 60000); // Check every minute
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);

    ws.on('close', () => {
      wsClients.delete(ws);
    });
  });

  // Start checking for upcoming tasks
  checkUpcomingTasks();

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

  return httpServer;
}