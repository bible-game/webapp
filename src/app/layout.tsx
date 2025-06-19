import type { Metadata, Viewport } from "next";
import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Bible Game",
  description: "A game that explores the Bible 📖✨",
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // Also supported but less commonly used
    // interactiveWidget: 'resizes-visual',
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en">
          <SpeedInsights/>
          <Head>
              <script src="./hammer.min.js" async />
          </Head>
          <body>
            <Providers>
                {children}
            </Providers>
          </body>
      </html>
);
}
