import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Add your API routes here
  // Example:
  // app.get("/api/example", (req, res) => {
  //   res.json({ message: "Hello from the API" });
  // });

  const httpServer = createServer(app);
  return httpServer;
}
