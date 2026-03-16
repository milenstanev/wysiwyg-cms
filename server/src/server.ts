import { config } from "./config/index.js";
import { Database } from "./database/Database.js";
import { PageRepository } from "./repositories/PageRepository.js";
import { PageService } from "./services/PageService.js";
import { PageController } from "./controllers/PageController.js";
import { createApp } from "./app.js";

async function bootstrap(): Promise<void> {
  const db = new Database(config.mongo.uri);
  await db.connect();

  const pageRepository = new PageRepository();
  const pageService = new PageService(pageRepository);
  const pageController = new PageController(pageService);

  const app = createApp({ pageController });

  const server = app.listen(config.port, () => {
    console.log(`API server listening on port ${config.port}`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await db.disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
