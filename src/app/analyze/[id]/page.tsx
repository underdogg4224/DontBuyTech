'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Product } from '@/types';
import { getProductById, sampleProducts } from '@/lib/data/sampleProducts';
import { analyzeProduct } from '@/lib/analysis';
import NeedAssessmentCard from '@/components/NeedAssessmentCard';
import AlternativeCard from '@/components/AlternativeCard';
import CostBreakdown from '@/components/CostBreakdown';
import EnvironmentalCard from '@/components/EnvironmentalCard';
import RecommendationCard from '@/components/RecommendationCard';
import ProductCard from '@/components/ProductCard';

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const productId = params.id as string;
    const foundProduct = getProductById(productId);

    if (foundProduct) {
      setProduct(foundProduct);

      // Perform analysis
      const result = analyzeProduct(foundProduct, {
        availableProducts: sampleProducts.filter(
          (p) => p.id !== foundProduct.id
        ),
        ownedProducts: [], // In a real app, this would come from user data
        includeInsurance: false,
        warrantyYears: 1,
        usageHoursPerDay: 8,
      });

      setAnalysis(result);
    }
  }, [params.id]);

  if (!product || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Products</span>
      </button>

      {/* Product Header */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <ProductCard product={product} />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Product Analysis
              </h1>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Key Features
                  </h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {product.features.slice(0, 8).map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Recommendation */}
      <div className="mb-8">
        <RecommendationCard recommendation={analysis.overallRecommendation} />
      </div>

      {/* Need Assessment */}
      <div className="mb-8">
        <NeedAssessmentCard assessment={analysis.needAssessment} />
      </div>

      {/* Two Column Layout for Cost & Environmental */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CostBreakdown tco={analysis.totalCostOfOwnership} />
        <EnvironmentalCard impact={analysis.environmentalImpact} />
      </div>

      {/* Ownership Check */}
      {analysis.ownershipCheck.ownedProducts.length > 0 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Do You Already Own Something Similar?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {analysis.ownershipCheck.recommendation}
            </p>
            <div className="space-y-3">
              {analysis.ownershipCheck.ownedProducts.map(
                (owned: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {owned.product.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Feature overlap: {owned.featureOverlap}%
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          owned.canReplace
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {owned.canReplace ? 'Can Replace' : 'Limited'}
                      </span>
                    </div>
                    {owned.limitations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {owned.limitations.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alternatives */}
      {analysis.alternatives.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Better Alternatives to Consider
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.alternatives.slice(0, 4).map((alt: any, index: number) => (
              <AlternativeCard
                key={index}
                alternative={alt}
                onSelect={() => router.push(`/analyze/${alt.product.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-8 text-center border border-primary-200 dark:border-primary-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Make Your Decision?
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Use this analysis to make an informed choice. Remember, the best tech
          purchase is often the one you don't make.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Analyze Another Product
          </button>
        </div>
      </div>
    </div>
  );
}
