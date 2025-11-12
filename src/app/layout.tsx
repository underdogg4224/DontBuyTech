import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'DontBuyTech - Make Informed Tech Purchase Decisions',
  description:
    'Honest analysis, alternatives finder, and cost comparison for tech products. Make smarter buying decisions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">
                  Don't Buy Tech
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (unless you really need it)
                </span>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="mt-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              DontBuyTech - Helping you make informed tech purchase decisions
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
