import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en">
          <SpeedInsights/>

          <body>
          <Providers>
              {children}
            </Providers>
            <script src="./hammer.min.js" async />
          </body>
      </html>
    );
}
