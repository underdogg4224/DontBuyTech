import { Product } from '@/types';
import { DollarSign, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  showAnalyzeButton?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  showAnalyzeButton = false,
}: ProductCardProps) {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800"
      onClick={onClick}
    >
      {product.imageUrl && (
        <div className="w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {product.brand}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xl font-bold text-gray-900 dark:text-white">
            <DollarSign className="w-5 h-5" />
            <span>{product.price.toLocaleString()}</span>
          </div>

          {product.rating && (
            <div className="flex items-center space-x-1 text-sm text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-gray-500 dark:text-gray-400">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        {showAnalyzeButton && (
          <button className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Analyze Product
          </button>
        )}
      </div>
    </div>
  );
}
