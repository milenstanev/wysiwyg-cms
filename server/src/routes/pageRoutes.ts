import { Router } from "express";
import type { PageController } from "../controllers/PageController.js";

export function createPageRoutes(pageController: PageController): Router {
  const router = Router();

  router.get("/", pageController.list);
  router.get("/:slug", pageController.getBySlug);
  router.put("/:slug", pageController.update);

  return router;
}
