import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { uiTheme } from "@/core/style/ui-theme";
import { IBM_Plex_Mono, IBM_Plex_Sans, Literata } from "next/font/google";
import type { Metadata, Viewport } from "next";

/** The interface: page titles, buttons, labels, the Home tagline */
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });
/** Addresses: book codes, chapter numbers, distances and the map's labels, so figures line up */
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
/** Scripture: anything from, or about, a specific passage (Play's clue, Read's text, quiz questions) */
const reading = Literata({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-reading", display: "swap" });

const description = "Explore the Bible with a daily passage-guessing game.";

export const metadata: Metadata = {
    metadataBase: new URL("https://bible.game"),
    title: { default: "Bible Game", template: "%s · Bible Game" },
    description,
    openGraph: { title: "Bible Game", description, url: "/", siteName: "Bible Game", type: "website" },
    twitter: { card: "summary_large_image", title: "Bible Game", description },
};

// Matches the charcoal page so the mobile browser's bars blend in
export const viewport: Viewport = { themeColor: uiTheme.bg, colorScheme: "dark" };

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en" className={`dark ${sans.variable} ${mono.variable} ${reading.variable}`} style={Object.fromEntries(Object.entries(uiTheme).map(([key, value]) => [`--ui-${key}`, value])) as React.CSSProperties}>
          <SpeedInsights/>
          <body>
          <Providers>
              {children}
            </Providers>
          </body>
      </html>
    );
}
