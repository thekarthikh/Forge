import type { Metadata } from "next";
import "./globals.css";
import { ForgeProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "Forge — Every day shapes who you become",
  description: "Forge is a daily consistency app. Build habits, track priorities, and watch your forge map grow — one square at a time. Don't break the chain.",
  keywords: "habit tracker, streak, consistency, daily habits, productivity, forge",
  openGraph: {
    title: "Forge — Every day shapes who you become",
    description: "Build identity through daily consistency. Don't break the chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ForgeProvider>
          {children}
        </ForgeProvider>
      </body>
    </html>
  );
}
