import type { Metadata } from "next";
import "@fontsource/google-sans/400.css";
import "@fontsource/google-sans/500.css";
import "@fontsource/google-sans/600.css";
import "@fontsource/google-sans/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUITify — Make room for your life",
  description: "A private, local-first space for changing habits.",
  applicationName: "QUITify",
  keywords: ["habit change", "quit habits", "wellbeing", "private", "local-first"],
  metadataBase: new URL("https://qui-tify-git-ui-redesign-v4-madebykramans-projects.vercel.app"),
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
    { media: "(prefers-color-scheme: light)", color: "#f6f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#070a10" },
  ],
  colorScheme: "light dark" as const,
};

const platformScript = `(()=>{try{const n=navigator||{};const ua=(n.userAgent||"").toLowerCase();const p=((n.userAgentData&&n.userAgentData.platform)||n.platform||"").toLowerCase();const touch=("ontouchstart" in window)||n.maxTouchPoints>1;const ios=/iphone|ipad|ipod/.test(ua)||(p.includes("mac")&&touch);const android=/android/.test(ua)||p.includes("android");const windows=/win/.test(p)||/windows/.test(ua);const macos=!ios&&!android&&!windows&&(/mac/.test(p)||/macintosh/.test(ua));document.documentElement.dataset.platform=ios?"ios":android?"android":windows?"windows":macos?"macos":"other"}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: platformScript}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
