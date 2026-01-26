/**
 * Category Not Found Page
 * Displayed when a category slug is invalid or doesn't exist
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoryNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
        <div className="mb-8 text-8xl">🔍</div>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          Category Not Found
        </h1>

        <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
          The category you're looking for doesn't exist or may have been removed.
        </p>

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/deals">Browse All Deals</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
