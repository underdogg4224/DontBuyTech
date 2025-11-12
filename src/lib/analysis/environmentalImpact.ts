import { Product, EnvironmentalImpact } from '@/types';

export function analyzeEnvironmentalImpact(
  product: Product,
  alternatives: Product[] = []
): EnvironmentalImpact {
  const carbonFootprint = calculateCarbonFootprint(product);
  const sustainability = assessSustainability(product);
  const comparison = compareWithAlternatives(product, alternatives);

  return {
    carbonFootprint,
    sustainability,
    comparison,
  };
}

function calculateCarbonFootprint(
  product: Product
): EnvironmentalImpact['carbonFootprint'] {
  // Base emissions by category (kg CO2)
  const manufacturingEmissions = getManufacturingEmissions(product);
  const shippingEmissions = getShippingEmissions(product);
  const usageEmissions = getAnnualUsageEmissions(product);
  const disposalEmissions = getDisposalEmissions(product);

  return {
    manufacturing: Math.round(manufacturingEmissions * 100) / 100,
    shipping: Math.round(shippingEmissions * 100) / 100,
    usage: Math.round(usageEmissions * 100) / 100,
    disposal: Math.round(disposalEmissions * 100) / 100,
    total: Math.round(
      (manufacturingEmissions + shippingEmissions + usageEmissions * 3 + disposalEmissions) *
        100
    ) / 100,
  };
}

function getManufacturingEmissions(product: Product): number {
  // Manufacturing emissions in kg CO2
  const emissionsByCategory: Record<string, number> = {
    smartphone: 80,
    laptop: 250,
    tablet: 130,
    smartwatch: 50,
    headphones: 15,
    camera: 100,
    gaming: 500, // Gaming PC/console
    smart_home: 40,
    wearables: 30,
    accessories: 10,
  };

  const baseEmission = emissionsByCategory[product.category] || 50;

  // Adjust for price (higher price often means more materials/complexity)
  const priceMultiplier = 1 + (product.price / 1000) * 0.2;

  return baseEmission * priceMultiplier;
}

function getShippingEmissions(product: Product): number {
  // Average shipping emissions per kg of product
  // Assuming international shipping
  const productWeight = estimateWeight(product);
  const emissionsPerKg = 0.5; // kg CO2 per kg of product

  return productWeight * emissionsPerKg;
}

function getAnnualUsageEmissions(product: Product): number {
  // Based on power consumption and average usage
  const powerConsumption = estimatePowerConsumption(product); // watts
  const hoursPerDay = estimateUsageHours(product);

  // kWh per year
  const kwhPerYear = (powerConsumption * hoursPerDay * 365) / 1000;

  // Average grid emissions: 0.4 kg CO2 per kWh
  return kwhPerYear * 0.4;
}

function getDisposalEmissions(product: Product): number {
  // E-waste disposal and recycling emissions
  const weight = estimateWeight(product);
  return weight * 0.3; // kg CO2 per kg of e-waste
}

function estimateWeight(product: Product): number {
  // Weight in kg
  const weightByCategory: Record<string, number> = {
    smartphone: 0.2,
    laptop: 1.8,
    tablet: 0.5,
    smartwatch: 0.05,
    headphones: 0.25,
    camera: 0.7,
    gaming: 5.0,
    smart_home: 0.3,
    wearables: 0.1,
    accessories: 0.15,
  };

  return weightByCategory[product.category] || 0.5;
}

function estimatePowerConsumption(product: Product): number {
  // Power consumption in watts
  const powerByCategory: Record<string, number> = {
    smartphone: 5,
    laptop: 50,
    tablet: 10,
    smartwatch: 1,
    headphones: 2,
    camera: 8,
    gaming: 300,
    smart_home: 15,
    wearables: 1,
    accessories: 3,
  };

  return powerByCategory[product.category] || 10;
}

function estimateUsageHours(product: Product): number {
  // Average daily usage hours
  const usageByCategory: Record<string, number> = {
    smartphone: 5,
    laptop: 8,
    tablet: 3,
    smartwatch: 16, // Always on
    headphones: 4,
    camera: 1,
    gaming: 3,
    smart_home: 24, // Always on
    wearables: 12,
    accessories: 4,
  };

  return usageByCategory[product.category] || 4;
}

function assessSustainability(
  product: Product
): EnvironmentalImpact['sustainability'] {
  const repairability = estimateRepairability(product);
  const recyclability = estimateRecyclability(product);
  const expectedLifespan = estimateLifespan(product);

  // Calculate overall sustainability score (0-100)
  const score =
    (repairability / 10) * 30 + // 30% weight
    recyclability * 0.4 + // 40% weight
    Math.min((expectedLifespan / 10) * 100, 100) * 0.3; // 30% weight

  return {
    score: Math.round(score),
    repairability,
    recyclability: Math.round(recyclability),
    expectedLifespan,
  };
}

function estimateRepairability(product: Product): number {
  // Repairability score 0-10 (10 = highly repairable)
  const repairabilityByCategory: Record<string, number> = {
    smartphone: 4, // Generally difficult to repair
    laptop: 6, // Varies by brand
    tablet: 3, // Very difficult
    smartwatch: 2, // Nearly impossible
    headphones: 5, // Moderate
    camera: 7, // Usually repairable
    gaming: 8, // PCs are very repairable
    smart_home: 5,
    wearables: 3,
    accessories: 6,
  };

  return repairabilityByCategory[product.category] || 5;
}

function estimateRecyclability(product: Product): number {
  // Recyclability percentage
  const recyclabilityByCategory: Record<string, number> = {
    smartphone: 60,
    laptop: 70,
    tablet: 65,
    smartwatch: 55,
    headphones: 50,
    camera: 65,
    gaming: 75,
    smart_home: 60,
    wearables: 55,
    accessories: 70,
  };

  return recyclabilityByCategory[product.category] || 60;
}

function estimateLifespan(product: Product): number {
  // Expected lifespan in years
  const lifespanByCategory: Record<string, number> = {
    smartphone: 3,
    laptop: 5,
    tablet: 4,
    smartwatch: 3,
    headphones: 4,
    camera: 8,
    gaming: 6,
    smart_home: 5,
    wearables: 3,
    accessories: 5,
  };

  // Adjust for price (higher quality often lasts longer)
  const baseLifespan = lifespanByCategory[product.category] || 4;
  const qualityMultiplier = product.price > 1000 ? 1.2 : product.price < 300 ? 0.8 : 1;

  return Math.round(baseLifespan * qualityMultiplier * 10) / 10;
}

function compareWithAlternatives(
  product: Product,
  alternatives: Product[]
): EnvironmentalImpact['comparison'] {
  const productFootprint = calculateCarbonFootprint(product).total;

  // Calculate average footprint for the category
  const categoryAverage = getManufacturingEmissions(product) * 1.5;
  const vsAverage = Math.round(((productFootprint - categoryAverage) / categoryAverage) * 100);

  const vsAlternatives = alternatives.map(alt => {
    const altFootprint = calculateCarbonFootprint(alt).total;
    return {
      productId: alt.id,
      productName: alt.name,
      difference: Math.round((productFootprint - altFootprint) * 100) / 100,
    };
  });

  return {
    vsAverage,
    vsAlternatives,
  };
}

export function getEnvironmentalRating(impact: EnvironmentalImpact): {
  rating: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor';
  message: string;
} {
  const score = impact.sustainability.score;

  if (score >= 80) {
    return {
      rating: 'excellent',
      message: 'Highly sustainable with minimal environmental impact',
    };
  } else if (score >= 65) {
    return {
      rating: 'good',
      message: 'Good environmental profile with room for improvement',
    };
  } else if (score >= 50) {
    return {
      rating: 'average',
      message: 'Average environmental impact for this category',
    };
  } else if (score >= 35) {
    return {
      rating: 'poor',
      message: 'Significant environmental concerns to consider',
    };
  } else {
    return {
      rating: 'very_poor',
      message: 'High environmental impact - consider alternatives',
    };
  }
}
