import express from "express";
import cors from "cors";
import helmetImport from "helmet";
import { createPageRoutes } from "./routes/pageRoutes.js";
import type { PageController } from "./controllers/PageController.js";

/** Vercel’s typecheck treats helmet’s CJS types as a non-callable namespace. */
type HelmetMiddleware = (options?: { contentSecurityPolicy?: boolean }) => express.RequestHandler;
const helmet = helmetImport as unknown as HelmetMiddleware;

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
