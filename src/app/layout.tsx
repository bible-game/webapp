import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { uiTheme } from "@/core/style/ui-theme";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en" className="dark" style={Object.fromEntries(Object.entries(uiTheme).map(([key, value]) => [`--ui-${key}`, value])) as React.CSSProperties}>
          <SpeedInsights/>
          <body>
          <Providers>
              {children}
            </Providers>
          </body>
      </html>
    );
}
