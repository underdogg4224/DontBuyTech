import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DontBuyTech - Smart Tech Comparison Engine',
  description: 'Make informed tech purchases with intelligent product comparisons, marketing gimmick detection, and longevity predictions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
