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
      layout: "single",
      blocks: [
        {
          id: "home-hero-h1",
          type: "heading",
          content: "Hello from the CMS",
          settings: { level: "1" },
        },
        {
          id: "home-banner",
          type: "banner",
          title: "Boutique Digital Publishing & Editorial Craft",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero sed cursus ante dapibus diam.",
        },
        {
          id: "home-intro-text",
          type: "text",
          content:
            "Edit this content in the admin panel. What you see is what you get. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        },
        {
          id: "home-showcase-1",
          type: "showcase",
          title: "Curated Design Systems",
          content:
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
        {
          id: "home-showcase-2",
          type: "showcase",
          title: "Zero Cumulative Layout Shift",
          content:
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        },
        {
          id: "home-table",
          type: "table",
          content: "",
          settings: {
            headerRow: true,
            striped: true,
            bordered: true,
            caption: "Core Architecture & Module Registry",
          },
          rows: [
            ["Component", "Discipline", "Latency", "State"],
            ["Theme Engine", "Dynamic CSS Tokens (6 Themes)", "< 1ms", "Active"],
            ["Grid System", "Responsive Fluid Layout", "Zero CLS", "Active"],
            ["Typography", "Editorial Serif & Tracking", "Native CSS", "Optimized"],
            ["Data Layer", "SQLite & Prisma Engine", "2.4ms", "Synchronized"],
          ],
        },
      ],
      leftBlocks: [
        {
          id: "home-left-h2",
          type: "heading",
          content: "Curated Highlights",
          settings: { level: "2" },
        },
        {
          id: "home-left-desc",
          type: "text",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
        },
        {
          id: "home-left-list",
          type: "list",
          content: "",
          settings: { listStyle: "bullet" },
          items: [
            "Atelier Theme Palette & Contrast Tuning",
            "Zero-Shift Responsive Layout Switching",
            "In-situ WYSIWYG Editing & Live Previews",
            "Accessible Keyboard and Screen Reader Semantics",
          ],
        },
        {
          id: "home-left-quote",
          type: "text",
          content:
            "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "about",
      slug: "about",
      title: "About Us",
      layout: "single",
      blocks: [
        {
          id: "about-story-h1",
          type: "heading",
          content: "Our Story & Studio Philosophy",
          settings: { level: "1" },
        },
        {
          id: "about-intro",
          type: "text",
          content:
            "We build modern web experiences. This CMS experiment demonstrates a decoupled, highly responsive architecture with immediate WYSIWYG editing. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
        {
          id: "about-story",
          type: "text",
          content:
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
        {
          id: "about-showcase-craft",
          type: "showcase",
          title: "Typographic Rigor & Restraint",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
        },
        {
          id: "about-showcase-clarity",
          type: "showcase",
          title: "Uncompromising Performance",
          content:
            "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
        },
        {
          id: "about-table",
          type: "table",
          content: "",
          settings: {
            headerRow: true,
            striped: true,
            bordered: true,
            caption: "Milestones & Evolution",
          },
          rows: [
            ["Year", "Milestone", "Focus"],
            ["2024", "Foundation & Design System Inception", "Visual Architecture"],
            ["2025", "Modular Content Engine Launch", "Decoupled Engineering"],
            ["2026", "Editorial Publishing Suite", "Holistic UX & Typography"],
          ],
        },
      ],
      leftBlocks: [
        {
          id: "about-left-h2",
          type: "heading",
          content: "Principles",
          settings: { level: "2" },
        },
        {
          id: "about-left-list",
          type: "list",
          content: "",
          settings: { listStyle: "bullet" },
          items: [
            "Clarity over complexity",
            "Zero layout shift",
            "Accessible contrast",
            "Intentional palettes",
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "blog",
      slug: "blog",
      title: "Blog",
      layout: "single",
      blocks: [
        {
          id: "blog-h2",
          type: "heading",
          content: "Latest Posts",
          settings: { level: "1" },
        },
        {
          id: "blog-intro",
          type: "text",
          content:
            "Here you can add blog posts, articles, and updates. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        },
        {
          id: "blog-post-1",
          type: "showcase",
          title: "The Architecture of Restrained Typography",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel sem sit amet ligula convallis feugiat in sit amet sem. Integer gravida imperdiet nulla, ac dapibus lorem finibus at. Sed feugiat, velit nec auctor molestie, magna diam tempus dolor.",
        },
        {
          id: "blog-post-2",
          type: "showcase",
          title: "Designing for Tactile Digital Reading",
          content:
            "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem. In porttitor. Donec laoreet nonummy augue.",
        },
        {
          id: "blog-post-3",
          type: "showcase",
          title: "Zero Cumulative Layout Shift in Modern CMS Systems",
          content:
            "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
        },
      ],
      leftBlocks: [
        {
          id: "blog-left-h2",
          type: "heading",
          content: "Topics & Series",
          settings: { level: "2" },
        },
        {
          id: "blog-left-list",
          type: "list",
          content: "",
          settings: { listStyle: "bullet" },
          items: [
            "Typography & Micro-interactions",
            "Theme Tokens & Contrast Systems",
            "Component-Driven Publishing",
            "Server-Side Rendering & Hydration",
          ],
        },
        {
          id: "blog-left-banner",
          type: "banner",
          title: "The Studio Dispatch",
          content:
            "Lorem ipsum dolor sit amet — a monthly digest on creative engineering and typography.",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "contact",
      slug: "contact",
      title: "Contact",
      layout: "single",
      blocks: [
        {
          id: "contact-h2",
          type: "heading",
          content: "Get in Touch",
          settings: { level: "1" },
        },
        {
          id: "contact-intro",
          type: "text",
          content:
            "We welcome dialogue regarding bespoke editorial design, frontend architecture, and consulting engagements. Email: hello@example.com | Phone: +1 234 567 8900. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
        {
          id: "contact-banner",
          type: "banner",
          title: "Commission an Editorial Project",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In hac habitasse platea dictumst.",
        },
        {
          id: "contact-table",
          type: "table",
          content: "",
          settings: {
            headerRow: true,
            striped: true,
            bordered: true,
            caption: "Studio Inquiries & Response Times",
          },
          rows: [
            ["Department", "Contact Channel", "Typical Response"],
            ["General Studio Inquiries", "hello@example.com", "< 24 hours"],
            ["Editorial & Design Press", "press@example.com", "1-2 business days"],
            ["Technical Architecture", "engineering@example.com", "< 12 hours"],
          ],
        },
      ],
      leftBlocks: [
        {
          id: "contact-left-h2",
          type: "heading",
          content: "Office & Hours",
          settings: { level: "2" },
        },
        {
          id: "contact-left-list",
          type: "list",
          content: "",
          settings: { listStyle: "bullet" },
          items: [
            "London Studio: 104 Atelier Way, EC1A 1BB",
            "Hours: Monday – Friday, 09:00 – 18:00 UTC",
            "Client Hotline: +1 (234) 567-8900",
            "Encrypted Wire: @editorial.cms",
          ],
        },
        {
          id: "contact-left-note",
          type: "text",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
  ];
}
