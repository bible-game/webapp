import "./globals.sass";
import React from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

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
