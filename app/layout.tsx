import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "DontBuyTech - AI-Powered Tech Deals Platform",
  description: "Discover the best tech deals with AI-powered recommendations and smart price tracking",
  keywords: ["tech deals", "discounts", "technology", "gadgets", "AI recommendations"],
  authors: [{ name: "DontBuyTech Team" }],
  openGraph: {
    title: "DontBuyTech - AI-Powered Tech Deals Platform",
    description: "Discover the best tech deals with AI-powered recommendations and smart price tracking",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
