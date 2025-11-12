import { Product } from './product';

export interface ProductAnalysis {
  product: Product;
  needAssessment: NeedAssessment;
  alternatives: Alternative[];
  ownershipCheck: OwnershipCheck;
  environmentalImpact: EnvironmentalImpact;
  totalCostOfOwnership: TotalCostOfOwnership;
  overallRecommendation: Recommendation;
}

export interface NeedAssessment {
  score: number; // 0-100, higher = more necessary
  verdict: 'essential' | 'beneficial' | 'optional' | 'unnecessary';
  reasons: string[];
  questions: Array<{
    question: string;
    answer: boolean;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

export interface Alternative {
  product: Product;
  comparisonScore: number; // 0-100, how well it matches needs
  priceComparison: {
    savings: number;
    percentage: number;
  };
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  recommendationReason: string;
}

export interface OwnershipCheck {
  hasAlternative: boolean;
  ownedProducts: Array<{
    product: Product;
    featureOverlap: number; // 0-100
    canReplace: boolean;
    limitations: string[];
  }>;
  recommendation: string;
}

export interface EnvironmentalImpact {
  carbonFootprint: {
    manufacturing: number; // kg CO2
    shipping: number; // kg CO2
    usage: number; // kg CO2 per year
    disposal: number; // kg CO2
    total: number; // kg CO2
  };
  sustainability: {
    score: number; // 0-100
    repairability: number; // 0-10
    recyclability: number; // 0-100%
    expectedLifespan: number; // years
  };
  comparison: {
    vsAverage: number; // percentage difference
    vsAlternatives: Array<{
      productId: string;
      productName: string;
      difference: number; // kg CO2
    }>;
  };
}

export interface TotalCostOfOwnership {
  initialCost: number;
  accessories: Array<{
    name: string;
    cost: number;
    necessity: 'required' | 'recommended' | 'optional';
  }>;
  maintenance: {
    warranty: number;
    repairs: number; // estimated per year
    insurance?: number; // per year
  };
  operatingCosts: {
    electricity: number; // per year
    subscription?: number; // per month
    cloudStorage?: number; // per month
  };
  depreciation: {
    year1: number;
    year2: number;
    year3: number;
    resaleValue: number;
  };
  totalFirstYear: number;
  totalThreeYears: number;
  totalFiveYears: number;
}

export interface Recommendation {
  verdict: 'buy' | 'consider_alternatives' | 'wait' | 'skip';
  confidence: number; // 0-100
  summary: string;
  keyPoints: string[];
  bestAlternative?: Alternative;
}
