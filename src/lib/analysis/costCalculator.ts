import { Product, TotalCostOfOwnership } from '@/types';

interface CostCalculatorInput {
  product: Product;
  warrantyYears?: number;
  includeInsurance?: boolean;
  usageHoursPerDay?: number;
}

export function calculateTotalCostOfOwnership(
  input: CostCalculatorInput
): TotalCostOfOwnership {
  const {
    product,
    warrantyYears = 1,
    includeInsurance = false,
    usageHoursPerDay = 8,
  } = input;

  const accessories = estimateAccessories(product);
  const maintenance = estimateMaintenance(
    product,
    warrantyYears,
    includeInsurance
  );
  const operatingCosts = estimateOperatingCosts(product, usageHoursPerDay);
  const depreciation = estimateDepreciation(product);

  // Calculate totals
  const accessoriesTotal = accessories.reduce((sum, acc) => sum + acc.cost, 0);
  const firstYearMaintenance = maintenance.warranty + (maintenance.insurance || 0);
  const firstYearOperating =
    operatingCosts.electricity +
    (operatingCosts.subscription || 0) * 12 +
    (operatingCosts.cloudStorage || 0) * 12;

  const totalFirstYear =
    product.price + accessoriesTotal + firstYearMaintenance + firstYearOperating;

  const annualOperating =
    operatingCosts.electricity +
    (operatingCosts.subscription || 0) * 12 +
    (operatingCosts.cloudStorage || 0) * 12 +
    maintenance.repairs +
    (maintenance.insurance || 0);

  const totalThreeYears = totalFirstYear + annualOperating * 2;
  const totalFiveYears = totalFirstYear + annualOperating * 4;

  return {
    initialCost: product.price,
    accessories,
    maintenance,
    operatingCosts,
    depreciation,
    totalFirstYear: Math.round(totalFirstYear * 100) / 100,
    totalThreeYears: Math.round(totalThreeYears * 100) / 100,
    totalFiveYears: Math.round(totalFiveYears * 100) / 100,
  };
}

function estimateAccessories(
  product: Product
): TotalCostOfOwnership['accessories'] {
  const accessories: TotalCostOfOwnership['accessories'] = [];

  switch (product.category) {
    case 'laptop':
      accessories.push(
        { name: 'Laptop bag/case', cost: 40, necessity: 'recommended' },
        { name: 'External mouse', cost: 25, necessity: 'recommended' },
        { name: 'USB-C hub/adapter', cost: 50, necessity: 'optional' },
        { name: 'Laptop stand', cost: 30, necessity: 'optional' }
      );
      break;
    case 'smartphone':
      accessories.push(
        { name: 'Phone case', cost: 25, necessity: 'required' },
        { name: 'Screen protector', cost: 15, necessity: 'recommended' },
        { name: 'Fast charger', cost: 35, necessity: 'optional' },
        { name: 'Wireless charger', cost: 30, necessity: 'optional' }
      );
      break;
    case 'camera':
      accessories.push(
        { name: 'Memory card (64GB)', cost: 30, necessity: 'required' },
        { name: 'Camera bag', cost: 60, necessity: 'required' },
        { name: 'Extra battery', cost: 50, necessity: 'recommended' },
        { name: 'Tripod', cost: 80, necessity: 'optional' },
        { name: 'Lens filters', cost: 70, necessity: 'optional' }
      );
      break;
    case 'tablet':
      accessories.push(
        { name: 'Tablet case', cost: 40, necessity: 'recommended' },
        { name: 'Screen protector', cost: 20, necessity: 'recommended' },
        { name: 'Stylus pen', cost: 100, necessity: 'optional' }
      );
      break;
    case 'headphones':
      accessories.push({ name: 'Carrying case', cost: 20, necessity: 'optional' });
      break;
    case 'smartwatch':
      accessories.push(
        { name: 'Extra band', cost: 40, necessity: 'optional' },
        { name: 'Screen protector', cost: 15, necessity: 'recommended' }
      );
      break;
  }

  return accessories;
}

function estimateMaintenance(
  product: Product,
  warrantyYears: number,
  includeInsurance: boolean
): TotalCostOfOwnership['maintenance'] {
  const baseWarrantyPrice = product.price * 0.1 * warrantyYears;
  const estimatedRepairs = product.price * 0.05; // 5% of product price per year

  return {
    warranty: Math.round(baseWarrantyPrice * 100) / 100,
    repairs: Math.round(estimatedRepairs * 100) / 100,
    insurance: includeInsurance
      ? Math.round(product.price * 0.08 * 100) / 100
      : undefined,
  };
}

function estimateOperatingCosts(
  product: Product,
  hoursPerDay: number
): TotalCostOfOwnership['operatingCosts'] {
  const costs: TotalCostOfOwnership['operatingCosts'] = {
    electricity: 0,
  };

  // Estimate power consumption (watts)
  let powerConsumption = 0;
  switch (product.category) {
    case 'laptop':
      powerConsumption = 50; // Average laptop
      break;
    case 'smartphone':
      powerConsumption = 5;
      break;
    case 'tablet':
      powerConsumption = 10;
      break;
    case 'smartwatch':
      powerConsumption = 1;
      break;
    case 'headphones':
      powerConsumption = 2;
      break;
    case 'gaming':
      powerConsumption = 300; // Gaming PC/console
      break;
    default:
      powerConsumption = 20;
  }

  // Calculate annual electricity cost
  // Formula: (watts * hours per day * 365 days) / 1000 * electricity rate
  const kwhPerYear = (powerConsumption * hoursPerDay * 365) / 1000;
  const electricityRate = 0.13; // Average US rate per kWh
  costs.electricity = Math.round(kwhPerYear * electricityRate * 100) / 100;

  // Add subscription costs for certain categories
  if (product.category === 'gaming') {
    costs.subscription = 9.99; // Gaming subscription
  } else if (['smartphone', 'tablet', 'laptop'].includes(product.category)) {
    costs.cloudStorage = 2.99; // Cloud storage subscription
  }

  return costs;
}

function estimateDepreciation(
  product: Product
): TotalCostOfOwnership['depreciation'] {
  const price = product.price;

  // Tech products typically depreciate: 30% year 1, 20% year 2, 15% year 3
  const year1Value = price * 0.7;
  const year2Value = year1Value * 0.8;
  const year3Value = year2Value * 0.85;

  return {
    year1: Math.round((price - year1Value) * 100) / 100,
    year2: Math.round((year1Value - year2Value) * 100) / 100,
    year3: Math.round((year2Value - year3Value) * 100) / 100,
    resaleValue: Math.round(year3Value * 100) / 100,
  };
}

export function compareOwnershipCosts(
  products: Product[]
): Array<{
  product: Product;
  tco: TotalCostOfOwnership;
  ranking: number;
}> {
  const costs = products.map(product => ({
    product,
    tco: calculateTotalCostOfOwnership({ product }),
    ranking: 0,
  }));

  // Sort by 3-year total cost
  costs.sort((a, b) => a.tco.totalThreeYears - b.tco.totalThreeYears);

  // Assign rankings
  costs.forEach((item, index) => {
    item.ranking = index + 1;
  });

  return costs;
}
