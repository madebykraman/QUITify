import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUITify — Make room for your life",
  description: "A private, local-first space for changing habits.",
  applicationName: "QUITify",
  keywords: ["habit change", "quit habits", "wellbeing", "private", "local-first"],
  metadataBase: new URL("https://qui-tify-five.vercel.app"),
  openGraph: {
    title: "QUITify — Make room for your life",
    description: "A private, local-first space for changing habits.",
    type: "website",
    siteName: "QUITify",
  },
  twitter: {
    card: "summary",
    title: "QUITify — Make room for your life",
    description: "A private, local-first space for changing habits.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0f" },
  ],
  colorScheme: "light dark" as const,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
