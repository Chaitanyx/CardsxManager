import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CardXManager",
  description: "Credit card spend tracking and rewards analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${outfit.variable} font-sans min-h-screen text-neutral-900`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
