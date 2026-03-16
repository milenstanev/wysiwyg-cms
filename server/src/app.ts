import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createPageRoutes } from "./routes/pageRoutes.js";
import type { PageController } from "./controllers/PageController.js";

export interface AppDependencies {
  pageController: PageController;
}

export function createApp(deps: AppDependencies): express.Application {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true }));
  app.use(express.json());

  app.use("/api/content", createPageRoutes(deps.pageController));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}
