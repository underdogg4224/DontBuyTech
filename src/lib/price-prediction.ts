// Price History Analysis and Best Time to Buy Recommendations

import type { PriceHistory, Product, PricePrediction } from '@/types';
import { differenceInMonths, addMonths, format } from 'date-fns';

/**
 * Analyze price trends and predict the best time to buy
 */
export function analyzePriceHistory(
  product: Product,
  priceHistory: PriceHistory[]
): PricePrediction {
  if (priceHistory.length < 2) {
    return {
      currentPrice: product.currentPrice,
      predictedLowPrice: product.currentPrice,
      predictedHighPrice: product.currentPrice,
      bestTimeToBuy: 'Insufficient price history data',
      confidence: 'low',
      reasoning: 'Not enough historical data to make predictions. Monitor for a few more months.',
    };
  }

  const sortedHistory = [...priceHistory].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()
  );

  // Calculate statistics
  const prices = sortedHistory.map((h) => h.price);
  const currentPrice = product.currentPrice;
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Calculate price trend
  const recentPrices = prices.slice(-3); // Last 3 data points
  const olderPrices = prices.slice(0, 3); // First 3 data points
  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
  const trendDirection = recentAvg < olderAvg ? 'decreasing' : 'increasing';

  // Calculate months since release
  const monthsSinceRelease = differenceInMonths(new Date(), product.releaseDate);

  // Predict future prices
  const volatility = Math.max(...prices) - Math.min(...prices);
  const predictedLowPrice = Math.max(
    product.msrp * 0.6, // Rarely drops below 60% of MSRP in first 2 years
    currentPrice - volatility * 0.3
  );
  const predictedHighPrice = Math.min(
    product.msrp * 1.2, // Rarely exceeds 120% of MSRP (demand surge)
    currentPrice + volatility * 0.2
  );

  // Determine best time to buy
  let bestTimeToBuy = '';
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  let reasoning = '';

  // Holiday season patterns (Nov-Dec)
  const now = new Date();
  const currentMonth = now.getMonth();
  const isHolidaySeason = currentMonth === 10 || currentMonth === 11; // Nov or Dec

  if (monthsSinceRelease < 3) {
    // New product - rarely discounted
    bestTimeToBuy = 'Wait 3-6 months for initial price drops';
    confidence = 'high';
    reasoning = `Product is only ${monthsSinceRelease} months old. New tech typically sees first significant discounts 3-6 months after release. Current price is ${((currentPrice / product.msrp) * 100).toFixed(0)}% of MSRP.`;
  } else if (monthsSinceRelease >= 10 && monthsSinceRelease < 14) {
    // Approaching next generation (usually 12-month cycle)
    bestTimeToBuy = 'Buy soon - next generation likely in 2-4 months';
    confidence = 'high';
    reasoning = `Product is ${monthsSinceRelease} months old. Next generation typically releases around the 12-month mark, which could drop this model's price by 15-30%. If you need it now, buy soon. If you can wait, expect deeper discounts in 2-4 months.`;
  } else if (isHolidaySeason) {
    if (currentPrice <= averagePrice * 0.9) {
      bestTimeToBuy = 'Great time to buy - holiday season with below-average pricing';
      confidence = 'high';
      reasoning = `Current price ($${currentPrice}) is below the historical average ($${averagePrice.toFixed(0)}). Holiday season typically offers the best deals, and this price is ${((currentPrice / averagePrice) * 100 - 100).toFixed(0)}% below average.`;
    } else {
      bestTimeToBuy = 'Wait for Black Friday/Cyber Monday deals';
      confidence = 'high';
      reasoning = `It's holiday season, but the current price is above average. Monitor for Black Friday and Cyber Monday deals, which could bring the price down to $${predictedLowPrice.toFixed(0)} or lower.`;
    }
  } else if (currentMonth >= 8 && currentMonth <= 9) {
    // Back to school season (Aug-Sep)
    bestTimeToBuy = 'Decent time - back-to-school sales, or wait for holidays';
    confidence = 'medium';
    reasoning = `Back-to-school season offers moderate discounts. Current price is $${currentPrice}. If you can wait 2-3 months, holiday season typically offers better deals (potentially $${predictedLowPrice.toFixed(0)}).`;
  } else if (trendDirection === 'decreasing') {
    bestTimeToBuy = 'Price is trending down - good time to buy or wait for further drops';
    confidence = 'medium';
    reasoning = `Price has been decreasing recently (${((recentAvg / olderAvg) * 100 - 100).toFixed(0)}% change). Current price ($${currentPrice}) is ${currentPrice < averagePrice ? 'below' : 'at'} the historical average. Could drop further to around $${predictedLowPrice.toFixed(0)}.`;
  } else if (currentPrice > averagePrice * 1.1) {
    bestTimeToBuy = 'Wait - price is above average';
    confidence = 'high';
    reasoning = `Current price ($${currentPrice}) is ${((currentPrice / averagePrice) * 100 - 100).toFixed(0)}% above the historical average ($${averagePrice.toFixed(0)}). Unless you need it urgently, wait for a sale. Target price: $${(averagePrice * 0.95).toFixed(0)} or below.`;
  } else if (currentPrice <= lowestPrice * 1.05) {
    bestTimeToBuy = 'Excellent time to buy - at or near lowest recorded price';
    confidence = 'high';
    reasoning = `Current price ($${currentPrice}) is within 5% of the all-time low ($${lowestPrice}). This is an excellent deal. Prices could go slightly lower, but the savings difference would be minimal ($${(currentPrice - predictedLowPrice).toFixed(0)} at most).`;
  } else {
    bestTimeToBuy = 'Decent time to buy - price is reasonable';
    confidence = 'medium';
    reasoning = `Current price ($${currentPrice}) is ${((currentPrice / averagePrice) * 100).toFixed(0)}% of the historical average. Not the lowest price ever ($${lowestPrice}), but a fair deal. For the best price, wait for seasonal sales or monitor for drops to $${predictedLowPrice.toFixed(0)}.`;
  }

  return {
    currentPrice,
    predictedLowPrice: Math.round(predictedLowPrice),
    predictedHighPrice: Math.round(predictedHighPrice),
    bestTimeToBuy,
    confidence,
    reasoning,
  };
}

/**
 * Get seasonal buying recommendations
 */
export function getSeasonalRecommendations(): {
  currentSeason: string;
  recommendations: string[];
} {
  const month = new Date().getMonth();

  const seasons: Record<number, { name: string; recommendations: string[] }> = {
    0: {
      name: 'January',
      recommendations: [
        'Post-holiday clearance sales',
        'Good time for TVs and home electronics',
        'Winter clearance on last year\'s models',
      ],
    },
    1: {
      name: 'February',
      recommendations: [
        'President\'s Day sales',
        'Tax refund season begins',
        'Good deals on previous year\'s models',
      ],
    },
    2: {
      name: 'March',
      recommendations: [
        'Spring sales begin',
        'New models announced (wait if not urgent)',
        'Good time for laptops and tablets',
      ],
    },
    3: {
      name: 'April',
      recommendations: [
        'Earth Day sales on energy-efficient products',
        'Spring cleaning sales',
        'Tax refunds create buying opportunity',
      ],
    },
    4: {
      name: 'May',
      recommendations: [
        'Memorial Day sales',
        'Good time for appliances',
        'Early summer deals',
      ],
    },
    5: {
      name: 'June',
      recommendations: [
        'Mid-year clearance',
        'Father\'s Day tech sales',
        'Prime Day preparation (wait for July)',
      ],
    },
    6: {
      name: 'July',
      recommendations: [
        'Amazon Prime Day and competing sales',
        'Mid-year clearance continues',
        'One of the best months for tech deals',
      ],
    },
    7: {
      name: 'August',
      recommendations: [
        'Back-to-school sales - excellent for laptops and tablets',
        'Retailers clear inventory for fall',
        'Great time for student tech purchases',
      ],
    },
    8: {
      name: 'September',
      recommendations: [
        'Labor Day sales',
        'New iPhone/flagship phone releases (old models drop in price)',
        'Back-to-school deals continue',
      ],
    },
    9: {
      name: 'October',
      recommendations: [
        'Wait for Black Friday if possible',
        'Columbus Day sales',
        'Amazon Prime Day 2 (fall edition)',
      ],
    },
    10: {
      name: 'November',
      recommendations: [
        'Black Friday - BEST time for tech deals',
        'Cyber Monday - online deals',
        'Thanksgiving week offers the year\'s deepest discounts',
      ],
    },
    11: {
      name: 'December',
      recommendations: [
        'Last-minute holiday sales',
        'Post-Christmas clearance',
        'Good time to buy, but not as good as Black Friday',
      ],
    },
  };

  const currentSeasonData = seasons[month];
  return {
    currentSeason: currentSeasonData.name,
    recommendations: currentSeasonData.recommendations,
  };
}
