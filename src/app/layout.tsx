import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DevHeartbeat } from "@/components/DevHeartbeat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "CMS Experiment", template: "%s | CMS Experiment" },
  description: "A decoupled CMS with WYSIWYG editing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("cms-theme");var ok=["editorial","pebble","atelier","harbor","nord","ink"];document.documentElement.setAttribute("data-theme",t&&ok.indexOf(t)!==-1?t:"editorial");}catch(e){document.documentElement.setAttribute("data-theme","editorial");}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <DevHeartbeat />
      </body>
    </html>
  );
}
