import type { Metadata } from "next";
import {
  Literata,
  Source_Sans_3,
  DM_Sans,
  Fraunces,
  Outfit,
  Source_Serif_4,
  IBM_Plex_Sans,
  IBM_Plex_Serif,
  Cormorant_Garamond,
  Karla,
  Forum,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";
import { DevHeartbeat } from "@/components/DevHeartbeat";

/** Editorial — literary serif display + clean humanist sans */
const editorialDisplay = Literata({
  variable: "--font-editorial-display",
  subsets: ["latin"],
  display: "swap",
});
const editorialSans = Source_Sans_3({
  variable: "--font-editorial-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Pebble — geometric studio sans (display + body) */
const pebbleSans = DM_Sans({
  variable: "--font-pebble-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Atelier — soft optical serif + warm rounded sans */
const atelierDisplay = Fraunces({
  variable: "--font-atelier-display",
  subsets: ["latin"],
  display: "swap",
});

/** Harbor — coastal modern sans + readable serif display */
const harborSans = Outfit({
  variable: "--font-harbor-sans",
  subsets: ["latin"],
  display: "swap",
});
const harborDisplay = Source_Serif_4({
  variable: "--font-harbor-display",
  subsets: ["latin"],
  display: "swap",
});

/** Nord — technical plex pair (arctic UI) */
const nordSans = IBM_Plex_Sans({
  variable: "--font-nord-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const nordDisplay = IBM_Plex_Serif({
  variable: "--font-nord-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Ink — high-contrast display serif + quiet grotesque */
const inkDisplay = Cormorant_Garamond({
  variable: "--font-ink-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const inkSans = Karla({
  variable: "--font-ink-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Gallery — quiet gallery serif + Outfit (reuses harbor sans) */
const galleryDisplay = Forum({
  variable: "--font-gallery-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fontVariables = [
  editorialDisplay.variable,
  editorialSans.variable,
  pebbleSans.variable,
  atelierDisplay.variable,
  harborSans.variable,
  harborDisplay.variable,
  nordSans.variable,
  nordDisplay.variable,
  inkDisplay.variable,
  inkSans.variable,
  galleryDisplay.variable,
  geistMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: { default: "WYSIWYG CMS", template: "%s | WYSIWYG CMS" },
  description: "A decoupled CMS with WYSIWYG editing",
  openGraph: {
    title: "WYSIWYG CMS",
    description: "A decoupled CMS with WYSIWYG editing",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("cms-theme");var ok=["editorial","pebble","atelier","harbor","nord","ink","gallery"];document.documentElement.setAttribute("data-theme",t&&ok.indexOf(t)!==-1?t:"editorial");}catch(e){document.documentElement.setAttribute("data-theme","editorial");}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <DevHeartbeat />
      </body>
    </html>
  );
}
