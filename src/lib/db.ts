// Mock database for demonstration
// In production, replace with actual Prisma client

import type { Product, Category, PriceHistory, Comparison } from '@/types';

// Sample categories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile phones and devices',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Portable computers',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Tablets',
    slug: 'tablets',
    description: 'Tablet computers',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Sample products
export const products: Product[] = [
  {
    id: 'phone-1',
    name: 'SuperPhone Pro 15',
    slug: 'superphone-pro-15',
    brand: 'TechCo',
    model: 'Pro 15',
    categoryId: '1',
    releaseDate: new Date('2024-09-15'),
    msrp: 1199,
    currentPrice: 1099,
    imageUrl: '/images/phone-1.jpg',
    description: 'Latest flagship with AI-powered camera',
    supportEndDate: new Date('2029-09-15'),
    warrantyYears: 1,
    repairabilityScore: 6,
    specifications: {
      display: '6.7" OLED, 120Hz',
      processor: 'A18 Pro',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP main, 12MP ultra-wide, 12MP telephoto',
      battery: '4500mAh',
      chargingSpeed: '27W wired, 15W wireless',
      os: 'CustomOS 15',
      weight: '220g',
      waterResistance: 'IP68',
      faceId: true,
      usbC: true,
    },
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'phone-2',
    name: 'SuperPhone Pro 14',
    slug: 'superphone-pro-14',
    brand: 'TechCo',
    model: 'Pro 14',
    categoryId: '1',
    releaseDate: new Date('2023-09-15'),
    msrp: 1099,
    currentPrice: 899,
    imageUrl: '/images/phone-2.jpg',
    description: 'Previous generation flagship',
    supportEndDate: new Date('2028-09-15'),
    warrantyYears: 1,
    repairabilityScore: 6,
    specifications: {
      display: '6.7" OLED, 120Hz',
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP main, 12MP ultra-wide, 12MP telephoto',
      battery: '4400mAh',
      chargingSpeed: '25W wired, 15W wireless',
      os: 'CustomOS 14 (upgradeable to 15)',
      weight: '225g',
      waterResistance: 'IP68',
      faceId: true,
      usbC: true,
    },
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'laptop-1',
    name: 'ProBook Air 15',
    slug: 'probook-air-15',
    brand: 'CompuCorp',
    model: 'Air 15',
    categoryId: '2',
    releaseDate: new Date('2024-06-01'),
    msrp: 1499,
    currentPrice: 1399,
    imageUrl: '/images/laptop-1.jpg',
    description: 'Thin and light laptop with long battery life',
    supportEndDate: new Date('2031-06-01'),
    warrantyYears: 1,
    repairabilityScore: 3,
    specifications: {
      display: '15.3" Liquid Retina, 2880x1864',
      processor: 'M3',
      ram: '16GB unified memory',
      storage: '512GB SSD',
      graphics: 'Integrated 10-core GPU',
      battery: '66Wh, up to 18 hours',
      weight: '1.5kg',
      ports: '2x USB-C, 1x headphone jack, MagSafe',
      wireless: 'Wi-Fi 6E, Bluetooth 5.3',
      keyboard: 'Backlit Magic Keyboard',
      touchId: true,
    },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

// Sample price history
export const priceHistory: PriceHistory[] = [
  // Phone 1 history
  { id: 'ph-1', productId: 'phone-1', price: 1199, source: 'Official Store', recordedAt: new Date('2024-09-15') },
  { id: 'ph-2', productId: 'phone-1', price: 1199, source: 'Amazon', recordedAt: new Date('2024-09-20') },
  { id: 'ph-3', productId: 'phone-1', price: 1149, source: 'Amazon', recordedAt: new Date('2024-10-15') },
  { id: 'ph-4', productId: 'phone-1', price: 1099, source: 'Amazon', recordedAt: new Date('2024-11-01') },

  // Phone 2 history
  { id: 'ph-5', productId: 'phone-2', price: 1099, source: 'Official Store', recordedAt: new Date('2023-09-15') },
  { id: 'ph-6', productId: 'phone-2', price: 999, source: 'Amazon', recordedAt: new Date('2024-01-15') },
  { id: 'ph-7', productId: 'phone-2', price: 949, source: 'Amazon', recordedAt: new Date('2024-06-15') },
  { id: 'ph-8', productId: 'phone-2', price: 899, source: 'Amazon', recordedAt: new Date('2024-09-20') },
];

export const comparisons: Comparison[] = [];

// Database functions
export const db = {
  categories: {
    findAll: async () => categories,
    findById: async (id: string) => categories.find((c) => c.id === id),
    findBySlug: async (slug: string) => categories.find((c) => c.slug === slug),
  },
  products: {
    findAll: async () => products,
    findById: async (id: string) => products.find((p) => p.id === id),
    findBySlug: async (slug: string) => products.find((p) => p.slug === slug),
    findByCategory: async (categoryId: string) => products.filter((p) => p.categoryId === categoryId),
  },
  priceHistory: {
    findByProduct: async (productId: string) =>
      priceHistory.filter((ph) => ph.productId === productId).sort((a, b) =>
        a.recordedAt.getTime() - b.recordedAt.getTime()
      ),
  },
  comparisons: {
    findAll: async () => comparisons,
    findById: async (id: string) => comparisons.find((c) => c.id === id),
    create: async (comparison: Comparison) => {
      comparisons.push(comparison);
      return comparison;
    },
  },
};
