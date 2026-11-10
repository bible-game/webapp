import { auth } from "@clerk/nextjs/server";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance, clerkLocalization } from "@/core/style/clerk-appearance";
import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { uiTheme } from "@/core/style/ui-theme";
import Ground from "@/core/component/ground";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Serif } from "next/font/google";
import type { Metadata, Viewport } from "next";

/** The interface: page titles, buttons, labels, the Home tagline, and Read's passage text */
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });
/** Addresses: book codes, chapter numbers, distances and the map's labels, so figures line up; also the clue and model summary */
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
/** Questions: Study's quiz questions */
const condensed = IBM_Plex_Sans_Condensed({ subsets: ["latin"], weight: ["500"], variable: "--font-condensed", display: "swap" });
// scripture in the map's chapter reader, loaded when first used
const serif = IBM_Plex_Serif({ subsets: ["latin"], weight: ["400"], variable: "--font-serif", display: "swap", preload: false });

const description = "Explore the Bible with a daily passage-guessing game.";

export const metadata: Metadata = {
    metadataBase: new URL("https://bible.game"),
    title: { default: "Bible Game", template: "%s · Bible Game" },
    description,
    openGraph: { title: "Bible Game", description, url: "/", siteName: "Bible Game", type: "website" },
    twitter: { card: "summary_large_image", title: "Bible Game", description },
};

// Matches the ground's edges so the mobile browser's bars blend in (see edge in ui-theme.ts)
export const viewport: Viewport = { themeColor: uiTheme.edge, colorScheme: "dark" };

export default async function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  const serverUserId = (await auth()).userId;
  return (
      <html lang="en" className={`dark ${sans.variable} ${mono.variable} ${condensed.variable} ${serif.variable}`} style={Object.fromEntries(Object.entries(uiTheme).map(([key, value]) => [`--ui-${key}`, value])) as React.CSSProperties}>
          <SpeedInsights/>
          <body>
            <ClerkProvider afterSignOutUrl="/" localization={clerkLocalization} appearance={clerkAppearance} signInUrl="/account/log-in" signUpUrl="/account/sign-up" signInForceRedirectUrl="/account/continue" signUpForceRedirectUrl="/account/continue">
              <Ground/>
              <Providers serverUserId={serverUserId}>
              {children}
              </Providers>
            </ClerkProvider>
          </body>
      </html>
    );
}
