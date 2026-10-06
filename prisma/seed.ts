import "dotenv/config";
import { prisma } from "../src/lib/db";
import fs from "fs";
import path from "path";

type PageFromJson = {
  id: string;
  slug: string;
  title: string;
  layout?: string;
  blocks: unknown[];
  leftBlocks?: unknown[];
  rightBlocks?: unknown[];
  positionBlocks?: unknown;
};

async function seed() {
  const file = path.join(process.cwd(), "content", "pages.json");
  let pages: PageFromJson[] = [];
  try {
    const data = await fs.promises.readFile(file, "utf-8");
    pages = JSON.parse(data);
  } catch {
    console.warn("No content/pages.json found, using defaults");
    pages = [
      {
        id: "home",
        slug: "home",
        title: "Welcome",
        layout: "single",
        blocks: [
          { id: "1", type: "heading", content: "Hello from the CMS" },
          {
            id: "2",
            type: "text",
            content: "Edit this content in the admin panel. What you see is what you get.",
          },
        ],
      },
      {
        id: "about",
        slug: "about",
        title: "About Us",
        layout: "single",
        blocks: [
          { id: "1", type: "heading", content: "Our Story" },
          { id: "2", type: "text", content: "We build modern web experiences." },
        ],
      },
      {
        id: "blog",
        slug: "blog",
        title: "Blog",
        layout: "single",
        blocks: [
          { id: "1", type: "heading", content: "Latest Posts" },
          { id: "2", type: "text", content: "Here you can add blog posts and updates." },
        ],
      },
      {
        id: "contact",
        slug: "contact",
        title: "Contact",
        layout: "single",
        blocks: [
          { id: "1", type: "heading", content: "Get in Touch" },
          { id: "2", type: "text", content: "Email: hello@example.com" },
        ],
      },
    ];
  }

  for (const p of pages) {
    await prisma.page.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        layout: p.layout ?? "single",
        blocks: JSON.stringify(p.blocks),
        leftBlocks: p.leftBlocks ? JSON.stringify(p.leftBlocks) : null,
        rightBlocks: p.rightBlocks ? JSON.stringify(p.rightBlocks) : null,
        positionBlocks: p.positionBlocks ? JSON.stringify(p.positionBlocks) : null,
      },
      update: {
        slug: p.slug,
        title: p.title,
        layout: p.layout ?? "single",
        blocks: JSON.stringify(p.blocks),
        leftBlocks: p.leftBlocks ? JSON.stringify(p.leftBlocks) : null,
        rightBlocks: p.rightBlocks ? JSON.stringify(p.rightBlocks) : null,
        positionBlocks: p.positionBlocks ? JSON.stringify(p.positionBlocks) : null,
      },
    });
    console.log(`Seeded page: ${p.slug}`);
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
