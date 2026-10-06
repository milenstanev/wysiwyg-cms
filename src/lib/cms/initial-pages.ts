import type { Page } from "./types";

/** Page fields stored as initial data; `updatedAt` is set when a page is written to the database. */
export type InitialPage = Omit<Page, "updatedAt">;

/**
 * Initial state for the CMS content, like the initial value passed to React `useState`.
 * Seeded into the database (`npm run db:seed`) and inserted on first read when a page is missing.
 * Saved edits are never overwritten; `npm run db:reset-content` restores these defaults.
 *
 * Layouts: Home = RocketTheme, About = two columns, Blog = one column, Contact = three columns.
 */
export const INITIAL_PAGES: InitialPage[] = [
  {
    id: "home",
    slug: "home",
    title: "Welcome",
    layout: "rockettheme",
    blocks: [
      {
        id: "home-hero-h1",
        type: "heading",
        content: "Hello from the CMS",
        settings: {
          level: "2",
        },
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
      {
        id: "home-features-heading",
        type: "heading",
        content: "Editorial Highlights & Capabilities",
        settings: {
          level: "2",
        },
      },
      {
        id: "home-features-list",
        type: "list",
        content: "",
        settings: {
          listStyle: "bullet",
        },
        items: [
          "Atelier Theme Palette & Dynamic CSS Token System",
          "Zero-Shift Responsive Layout Switching across all viewports",
          "In-situ WYSIWYG Editing with instant local & server synchronization",
          "Accessible Keyboard and Screen Reader Semantics by default",
        ],
      },
      {
        id: "home-closing-text",
        type: "text",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      },
    ],
    leftBlocks: [
      {
        id: "home-left-h2",
        type: "heading",
        content: "Highlights",
        settings: {
          level: "2",
        },
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
        settings: {
          listStyle: "bullet",
        },
        items: [
          "Atelier Theme Palette",
          "Zero-Shift Layout Switching",
          "In-situ WYSIWYG Editing",
          "Accessible Semantics",
        ],
      },
      {
        id: "home-left-quote",
        type: "text",
        content:
          "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.",
      },
    ],
    rightBlocks: [
      {
        id: "home-right-h2",
        type: "heading",
        content: "Insights",
        settings: {
          level: "2",
        },
      },
      {
        id: "home-right-text",
        type: "text",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque lorem non ipsum ultrices, at tristique augue interdum.",
      },
    ],
    positionBlocks: {
      "utility-a": [
        {
          id: "home-utility-a",
          type: "text",
          content: "Search the atelier archive",
        },
      ],
      "utility-b": [
        {
          id: "home-utility-b",
          type: "text",
          content: "Member login · Studio desk",
        },
      ],
      "utility-c": [
        {
          id: "home-utility-c",
          type: "text",
          content: "EN · FR · DE",
        },
      ],
      header: [
        {
          id: "home-header-brand",
          type: "heading",
          content: "WYSIWYG CMS Atelier",
          settings: {
            level: "2",
          },
        },
        {
          id: "home-header-tagline",
          type: "text",
          content: "Lorem ipsum dolor sit amet — editorial publishing for the modern web.",
        },
      ],
      navigation: [
        {
          id: "home-nav-list",
          type: "list",
          content: "",
          settings: {
            listStyle: "bullet",
          },
          items: ["Home", "About", "Blog", "Contact"],
        },
      ],
      "showcase-a": [
        {
          id: "home-rt-showcase-a",
          type: "showcase",
          title: "Modular Positions",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Utility, showcase, and footer rows adapt when empty.",
        },
      ],
      "showcase-b": [
        {
          id: "home-rt-showcase-b",
          type: "showcase",
          title: "Single-Column Mainbody",
          content:
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Content blocks stack in one main column.",
        },
      ],
      "showcase-c": [
        {
          id: "home-rt-showcase-c",
          type: "showcase",
          title: "Theme Tokens",
          content:
            "Ut enim ad minim veniam, quis nostrud exercitation. Spacing and color follow the shared design tokens.",
        },
      ],
      "showcase-d": [
        {
          id: "home-rt-showcase-d",
          type: "showcase",
          title: "Optional Blog",
          content:
            "Duis aute irure dolor in reprehenderit. Blog appears in nav only when it has blocks for its layout.",
        },
      ],
      "bottom-a": [
        {
          id: "home-bottom-a",
          type: "banner",
          title: "Pre-footer Band",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.",
        },
      ],
      "bottom-b": [
        {
          id: "home-bottom-b",
          type: "text",
          content:
            "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
        },
      ],
      "footer-a": [
        {
          id: "home-footer-a",
          type: "heading",
          content: "Studio",
          settings: {
            level: "3",
          },
        },
        {
          id: "home-footer-a-text",
          type: "text",
          content: "London · Remote · Atelier Way",
        },
      ],
      "footer-b": [
        {
          id: "home-footer-b",
          type: "heading",
          content: "Explore",
          settings: {
            level: "3",
          },
        },
        {
          id: "home-footer-b-list",
          type: "list",
          content: "",
          settings: {
            listStyle: "bullet",
          },
          items: ["Layouts", "Themes", "Blocks"],
        },
      ],
      "footer-c": [
        {
          id: "home-footer-c",
          type: "heading",
          content: "Support",
          settings: {
            level: "3",
          },
        },
        {
          id: "home-footer-c-text",
          type: "text",
          content: "hello@example.com",
        },
      ],
      "footer-d": [
        {
          id: "home-footer-d",
          type: "heading",
          content: "Legal",
          settings: {
            level: "3",
          },
        },
        {
          id: "home-footer-d-text",
          type: "text",
          content: "© WYSIWYG CMS. Lorem ipsum.",
        },
      ],
    },
  },
  {
    id: "about",
    slug: "about",
    title: "About Us",
    layout: "two-col",
    blocks: [
      {
        id: "about-story-h1",
        type: "heading",
        content: "Our Story & Studio Philosophy",
        settings: {
          level: "2",
        },
      },
      {
        id: "about-intro",
        type: "text",
        content:
          "We build modern web experiences. This CMS demonstrates a decoupled, highly responsive architecture with immediate WYSIWYG editing. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
      {
        id: "about-principles-heading",
        type: "heading",
        content: "Guiding Principles",
        settings: {
          level: "2",
        },
      },
      {
        id: "about-principles-list",
        type: "list",
        content: "",
        settings: {
          listStyle: "bullet",
        },
        items: [
          "Clarity over decorative complexity",
          "Zero layout shift during state changes",
          "Accessible contrast and motion compliance",
          "Warm, intentional palettes across themes",
        ],
      },
      {
        id: "about-quote",
        type: "text",
        content:
          "“Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...”",
      },
    ],
    leftBlocks: [
      {
        id: "about-left-h2",
        type: "heading",
        content: "Principles",
        settings: {
          level: "2",
        },
      },
      {
        id: "about-left-list",
        type: "list",
        content: "",
        settings: {
          listStyle: "bullet",
        },
        items: [
          "Clarity over complexity",
          "Zero layout shift",
          "Accessible contrast",
          "Intentional palettes",
        ],
      },
    ],
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
        settings: {
          level: "2",
        },
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
        settings: {
          level: "2",
        },
      },
      {
        id: "blog-left-list",
        type: "list",
        content: "",
        settings: {
          listStyle: "bullet",
        },
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
  },
  {
    id: "contact",
    slug: "contact",
    title: "Contact",
    layout: "three-col",
    blocks: [
      {
        id: "contact-h2",
        type: "heading",
        content: "Get in Touch",
        settings: {
          level: "2",
        },
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
        settings: {
          level: "2",
        },
      },
      {
        id: "contact-left-list",
        type: "list",
        content: "",
        settings: {
          listStyle: "bullet",
        },
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
    rightBlocks: [
      {
        id: "contact-right-h2",
        type: "heading",
        content: "Follow the Studio",
        settings: {
          level: "2",
        },
      },
      {
        id: "contact-right-list",
        type: "list",
        content: "",
        settings: {
          listStyle: "bullet",
        },
        items: [
          "Journal · Monthly dispatch",
          "Instagram · @editorial.cms",
          "LinkedIn · WYSIWYG CMS Studio",
        ],
      },
      {
        id: "contact-right-note",
        type: "text",
        content:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Press kits available on request.",
      },
    ],
  },
];
