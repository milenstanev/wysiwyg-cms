import "dotenv/config";
import { prisma } from "../src/lib/db";
import { INITIAL_PAGES } from "../src/lib/cms/initial-pages";
import { insertMissingInitialPages, resetToInitialPages } from "../src/lib/cms/store-db";

/**
 * Writes the initial state (`src/lib/cms/initial-pages.ts`) into the database.
 * Default: insert pages that are missing, keep edited pages as they are.
 * `--reset`: overwrite the initial pages with their default content.
 */
async function seed() {
  if (process.argv.includes("--reset")) {
    await resetToInitialPages();
    console.log(`Reset ${INITIAL_PAGES.length} pages to initial state`);
    return;
  }
  const inserted = await insertMissingInitialPages();
  console.log(
    `Inserted ${inserted} missing page(s); ${INITIAL_PAGES.length - inserted} already in the database`
  );
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
