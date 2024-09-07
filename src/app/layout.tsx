import type { Metadata } from "next";
import "./globals.sass";

export const metadata: Metadata = {
  title: "Bible Game",
  description: "Explore the Bible with a daily passage-guessing game",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
