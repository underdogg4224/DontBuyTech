import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DontBuyTech - Crowd-Sourced Regret Database",
  description: "A community-driven database of tech products people regret buying",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-red-600">
                  DontBuyTech
                </a>
              </div>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Browse
                </a>
                <a href="/submit" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Submit Product
                </a>
                <a href="/validator" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Use Case Validator
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
