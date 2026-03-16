import { Page } from "./types";
import path from "path";
import fs from "fs/promises";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PAGES_FILE = path.join(CONTENT_DIR, "pages.json");

async function ensureContentDir() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
}

export async function loadPages(): Promise<Page[]> {
  try {
    await ensureContentDir();
    const data = await fs.readFile(PAGES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return getDefaultPages();
  }
}

export async function savePages(pages: Page[]): Promise<void> {
  await ensureContentDir();
  await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2));
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pages = await loadPages();
  return pages.find((p) => p.slug === slug) ?? null;
}

export async function updatePage(updated: Page): Promise<Page> {
  const pages = await loadPages();
  const index = pages.findIndex((p) => p.id === updated.id);
  if (index >= 0) {
    pages[index] = { ...updated, updatedAt: new Date().toISOString() };
  } else {
    pages.push({ ...updated, updatedAt: new Date().toISOString() });
  }
  await savePages(pages);
  return pages[index] ?? updated;
}

function getDefaultPages(): Page[] {
  return [
    {
      id: "home",
      slug: "home",
      title: "Welcome",
      blocks: [
        { id: "1", type: "heading", content: "Hello from the CMS" },
        {
          id: "2",
          type: "text",
          content:
            "Edit this content in the admin panel. What you see is what you get.",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "about",
      slug: "about",
      title: "About Us",
      blocks: [
        { id: "1", type: "heading", content: "Our Story" },
        {
          id: "2",
          type: "text",
          content:
            "We build modern web experiences. This CMS experiment shows a decoupled architecture with a WYSIWYG admin.",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "blog",
      slug: "blog",
      title: "Blog",
      blocks: [
        { id: "1", type: "heading", content: "Latest Posts" },
        {
          id: "2",
          type: "text",
          content:
            "Here you can add blog posts, articles, and updates. Edit this in the admin to add real content.",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "contact",
      slug: "contact",
      title: "Contact",
      blocks: [
        { id: "1", type: "heading", content: "Get in Touch" },
        {
          id: "2",
          type: "text",
          content: "Email: hello@example.com | Phone: +1 234 567 8900",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
  ];
}
