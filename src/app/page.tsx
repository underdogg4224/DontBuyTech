import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">DontBuyTech</h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
          Smart Tech Comparison Engine - Make informed purchasing decisions
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Link
            href="/compare"
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Compare Products</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Compare specs with plain-language explanations and real improvement analysis
            </p>
          </Link>

          <Link
            href="/products"
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Browse Products</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explore tech products with detailed specifications and honest reviews
            </p>
          </Link>

          <Link
            href="/price-tracker"
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Price Tracker</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track price history and get recommendations on the best time to buy
            </p>
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✓ Plain-language spec comparisons</li>
            <li>✓ Marketing gimmick detection</li>
            <li>✓ Year-over-year upgrade analysis</li>
            <li>✓ Price history tracking</li>
            <li>✓ Longevity predictions based on support cycles</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
