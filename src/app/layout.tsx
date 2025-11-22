import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentic TikTok Automator",
  description:
    "Upload one photo and automatically script, render, and schedule TikTok videos that drive daily revenue.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Agentic TikTok Automator",
    description:
      "AI pipeline that turns a single portrait into profitable TikTok drops on autopilot.",
    type: "website",
    url: "https://agentic-a3f8ba33.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agentic TikTok Automator",
    description:
      "Generate scripts, render motion portraits, and schedule TikTok posts in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
