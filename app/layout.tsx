import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUITify — Make room for your life",
  description: "A private, local-first space for changing habits.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
