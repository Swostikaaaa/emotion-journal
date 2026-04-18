// app/layout.tsx
// Root layout component that wraps the entire application.
// It sets up fonts, metadata, and the NextAuth session provider.

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// Load Google Fonts with CSS variables for custom styling
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// Metadata for SEO and browser tab display
export const metadata: Metadata = {
  title: "Emotion Journal",
  description: "Track your emotions and topics with a beautiful journal",
};

// RootLayout component – receives all page content as children
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language and apply font CSS variables
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      {/* Apply the Inter font to the body */}
      <body className={inter.className}>
        {/* Wrap children with NextAuth SessionProvider (from providers.tsx) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}