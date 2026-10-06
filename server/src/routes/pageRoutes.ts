import { Router } from "express";
import type { PageController } from "../controllers/PageController.js";

export function createPageRoutes(pageController: PageController): Router {
  const router = Router();

  router.get("/", pageController.list);
  router.post("/", pageController.create);
  router.get("/:slug", pageController.getBySlug);
  router.put("/:slug", pageController.update);
  router.delete("/:slug", pageController.remove);
  router.post("/:slug/duplicate", pageController.duplicate);

  return router;
}
