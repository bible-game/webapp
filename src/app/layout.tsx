import type { Metadata } from "next";
import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Bible Game",
  description: "A game that explores the Bible 📖✨",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
      <html lang="en">
          <SpeedInsights/>
          <body>
              <Providers>
                  {children}
              </Providers>
          </body>
      </html>
);
}
