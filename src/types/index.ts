// Type definitions for the Smart Tech Comparison Engine

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  categoryId: string;
  releaseDate: Date;
  msrp: number;
  currentPrice: number;
  imageUrl?: string;
  description?: string;

  // Support and longevity info
  supportEndDate?: Date;
  warrantyYears?: number;
  repairabilityScore?: number; // 1-10 scale

  // Specifications
  specifications: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  source: string;
  recordedAt: Date;
}

export interface SpecComparison {
  specName: string;
  product1Value: any;
  product2Value: any;
  difference: string;
  explanation: string;
  improvementType: 'significant' | 'marginal' | 'none' | 'worse';
  isMarketingGimmick: boolean;
  gimmickReason?: string;
}

export interface MarketingGimmick {
  feature: string;
  reason: string;
  actualImpact: string;
}

export interface RealImprovement {
  feature: string;
  improvement: string;
  practicalBenefit: string;
  worthUpgrade: boolean;
}

export interface YearOverYearAnalysis {
  yearlyPriceChange: number;
  significantImprovements: string[];
  minorImprovements: string[];
  removedFeatures: string[];
  recommendation: string;
}

export interface Comparison {
  id: string;
  product1Id: string;
  product2Id: string;

  // Results
  specComparisons: SpecComparison[];
  marketingGimmicks: MarketingGimmick[];
  realImprovements: RealImprovement[];
  upgradeRecommendation: 'Highly Recommended' | 'Recommended' | 'Consider Your Needs' | 'Not Worth It' | 'Avoid';
  upgradeScore: number; // 1-10

  // Year-over-year
  isYearOverYear: boolean;
  yearOverYearAnalysis?: YearOverYearAnalysis;

  createdAt: Date;
}

export interface PricePrediction {
  currentPrice: number;
  predictedLowPrice: number;
  predictedHighPrice: number;
  bestTimeToBuy: string;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface LongevityPrediction {
  expectedLifespan: number; // in years
  supportLifespan: number; // in years
  repairabilityScore: number; // 1-10
  longevityScore: number; // 1-10
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendation: string;
}
