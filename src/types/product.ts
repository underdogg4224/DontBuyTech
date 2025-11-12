export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  currency: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  imageUrl?: string;
  releaseDate?: string;
  retailer?: string;
  rating?: number;
  reviewCount?: number;
}

export enum ProductCategory {
  SMARTPHONE = 'smartphone',
  LAPTOP = 'laptop',
  TABLET = 'tablet',
  SMARTWATCH = 'smartwatch',
  HEADPHONES = 'headphones',
  CAMERA = 'camera',
  GAMING = 'gaming',
  SMART_HOME = 'smart_home',
  WEARABLES = 'wearables',
  ACCESSORIES = 'accessories',
  OTHER = 'other',
}

export interface ProductOwnership {
  productId: string;
  userOwnedProducts: Product[];
  similarFeatures: string[];
  overlapPercentage: number;
  recommendation: 'unnecessary' | 'consider' | 'worthwhile';
  reasons: string[];
}
