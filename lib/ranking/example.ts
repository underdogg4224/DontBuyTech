/**
 * Example usage of the enhanced ranking algorithm
 * This file demonstrates how to use the ranking system in various scenarios
 */

import {
  calculateDealRanking,
  calculateBatchRankings,
  getRankingTier,
  getFreshnessCategory,
  type RankingInput,
} from './index';

// ============================================================================
// Example 1: Calculate ranking for a single deal
// ============================================================================

function example1_BasicRanking() {
  console.log('=== Example 1: Basic Ranking ===\n');

  const dealData: RankingInput = {
    dealId: 'deal-001',
    upvotes: 150,
    downvotes: 10,
    createdAt: new Date('2024-11-01'),
    aiQualityScore: 85,
    categoryPopularity: 45,
    discountPercentage: 60,
  };

  const result = calculateDealRanking(dealData);

  console.log('Input:');
  console.log('- Upvotes:', dealData.upvotes);
  console.log('- Downvotes:', dealData.downvotes);
  console.log('- AI Quality:', dealData.aiQualityScore);
  console.log('- Category Popularity:', dealData.categoryPopularity);
  console.log('- Discount:', dealData.discountPercentage + '%');
  console.log('\nOutput:');
  console.log('- Final Score:', result.finalScore);
  console.log('- Ranking Tier:', getRankingTier(result.finalScore));
  console.log('- Freshness:', getFreshnessCategory(dealData.createdAt));
  console.log('\nBreakdown:');
  console.log('- Base Score (votes):', result.metadata.base_score);
  console.log('- AI Boost:', result.metadata.ai_quality_component);
  console.log('- Category Boost:', result.metadata.category_component);
  console.log('- Discount Boost:', result.metadata.discount_component);
  console.log('- Freshness Decay:', result.metadata.freshness_decay?.toFixed(3));
  console.log('');
}

// ============================================================================
// Example 2: Compare new vs old deals
// ============================================================================

function example2_TimeDecayComparison() {
  console.log('=== Example 2: Time Decay Comparison ===\n');

  const baseData = {
    dealId: 'comparison',
    upvotes: 100,
    downvotes: 10,
    aiQualityScore: 75,
  };

  // Brand new deal
  const newDeal = calculateDealRanking({
    ...baseData,
    createdAt: new Date(), // Today
  });

  // 30 days old (one half-life)
  const monthOld = new Date();
  monthOld.setDate(monthOld.getDate() - 30);
  const oldDeal = calculateDealRanking({
    ...baseData,
    createdAt: monthOld,
  });

  // 60 days old (two half-lives)
  const twoMonthsOld = new Date();
  twoMonthsOld.setDate(twoMonthsOld.getDate() - 60);
  const veryOldDeal = calculateDealRanking({
    ...baseData,
    createdAt: twoMonthsOld,
  });

  console.log('Same deal at different ages:');
  console.log('\nBrand New:');
  console.log('- Score:', newDeal.finalScore);
  console.log('- Decay Factor:', newDeal.metadata.freshness_decay?.toFixed(3));

  console.log('\n30 Days Old:');
  console.log('- Score:', oldDeal.finalScore);
  console.log('- Decay Factor:', oldDeal.metadata.freshness_decay?.toFixed(3));
  console.log('- Score Retention:', ((oldDeal.finalScore / newDeal.finalScore) * 100).toFixed(1) + '%');

  console.log('\n60 Days Old:');
  console.log('- Score:', veryOldDeal.finalScore);
  console.log('- Decay Factor:', veryOldDeal.metadata.freshness_decay?.toFixed(3));
  console.log('- Score Retention:', ((veryOldDeal.finalScore / newDeal.finalScore) * 100).toFixed(1) + '%');
  console.log('');
}

// ============================================================================
// Example 3: Batch processing multiple deals
// ============================================================================

function example3_BatchProcessing() {
  console.log('=== Example 3: Batch Processing ===\n');

  const deals: RankingInput[] = [
    {
      dealId: 'laptop-deal',
      upvotes: 200,
      downvotes: 15,
      createdAt: new Date(),
      aiQualityScore: 90,
      categoryPopularity: 70,
      discountPercentage: 45,
    },
    {
      dealId: 'phone-deal',
      upvotes: 150,
      downvotes: 8,
      createdAt: new Date(),
      aiQualityScore: 85,
      categoryPopularity: 80,
      discountPercentage: 30,
    },
    {
      dealId: 'headphones-deal',
      upvotes: 75,
      downvotes: 5,
      createdAt: new Date(),
      aiQualityScore: 75,
      categoryPopularity: 60,
      discountPercentage: 55,
    },
  ];

  const results = calculateBatchRankings(deals);

  // Sort by final score
  const sorted = results.sort((a, b) => b.finalScore - a.finalScore);

  console.log('Ranked deals:');
  sorted.forEach((result, index) => {
    const deal = deals.find(d => d.dealId === result.metadata.upvotes);
    console.log(`\n${index + 1}. Deal ID: ${deals[index].dealId}`);
    console.log(`   Score: ${result.finalScore}`);
    console.log(`   Tier: ${getRankingTier(result.finalScore)}`);
    console.log(`   Base: ${result.metadata.base_score} | AI: ${result.metadata.ai_quality_component} | Category: ${result.metadata.category_component}`);
  });
  console.log('');
}

// ============================================================================
// Example 4: Impact of different factors
// ============================================================================

function example4_FactorImpact() {
  console.log('=== Example 4: Impact of Different Factors ===\n');

  const baseData: RankingInput = {
    dealId: 'test',
    upvotes: 50,
    downvotes: 5,
    createdAt: new Date(),
  };

  // No enhancements
  const baseline = calculateDealRanking(baseData);

  // With AI quality
  const withAI = calculateDealRanking({
    ...baseData,
    aiQualityScore: 90,
  });

  // With category boost
  const withCategory = calculateDealRanking({
    ...baseData,
    categoryPopularity: 60,
  });

  // With discount
  const withDiscount = calculateDealRanking({
    ...baseData,
    discountPercentage: 75,
  });

  // With everything
  const withAll = calculateDealRanking({
    ...baseData,
    aiQualityScore: 90,
    categoryPopularity: 60,
    discountPercentage: 75,
  });

  console.log('Impact of different boost factors:');
  console.log('\nBaseline (votes only):', baseline.finalScore);
  console.log('+ AI Quality (90/100):', withAI.finalScore, `(+${(withAI.finalScore - baseline.finalScore).toFixed(1)})`);
  console.log('+ Category (60):', withCategory.finalScore, `(+${(withCategory.finalScore - baseline.finalScore).toFixed(1)})`);
  console.log('+ Discount (75%):', withDiscount.finalScore, `(+${(withDiscount.finalScore - baseline.finalScore).toFixed(1)})`);
  console.log('+ All Combined:', withAll.finalScore, `(+${(withAll.finalScore - baseline.finalScore).toFixed(1)})`);
  console.log('');
}

// ============================================================================
// Example 5: Real-world scenario - Reddit-style "hot" algorithm comparison
// ============================================================================

function example5_HotDeals() {
  console.log('=== Example 5: "Hot" Deals Detection ===\n');

  // Deal 1: Lots of votes, but old
  const popularOld = calculateDealRanking({
    dealId: 'popular-old',
    upvotes: 500,
    downvotes: 50,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    aiQualityScore: 80,
  });

  // Deal 2: Moderate votes, very recent
  const moderateNew = calculateDealRanking({
    dealId: 'moderate-new',
    upvotes: 100,
    downvotes: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    aiQualityScore: 85,
  });

  // Deal 3: Few votes, but brand new and high quality
  const newHighQuality = calculateDealRanking({
    dealId: 'new-quality',
    upvotes: 30,
    downvotes: 2,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    aiQualityScore: 95,
    discountPercentage: 80,
  });

  console.log('Which deal should rank highest?');
  console.log('\nDeal 1 - Popular but Old (45 days, 500 upvotes):');
  console.log('  Score:', popularOld.finalScore);
  console.log('  Tier:', getRankingTier(popularOld.finalScore));

  console.log('\nDeal 2 - Moderate and New (2 hours, 100 upvotes):');
  console.log('  Score:', moderateNew.finalScore);
  console.log('  Tier:', getRankingTier(moderateNew.finalScore));

  console.log('\nDeal 3 - New High Quality (30 min, 30 upvotes, 95% AI, 80% discount):');
  console.log('  Score:', newHighQuality.finalScore);
  console.log('  Tier:', getRankingTier(newHighQuality.finalScore));

  // Determine winner
  const deals = [
    { name: 'Deal 1 (Popular Old)', score: popularOld.finalScore },
    { name: 'Deal 2 (Moderate New)', score: moderateNew.finalScore },
    { name: 'Deal 3 (New High Quality)', score: newHighQuality.finalScore },
  ].sort((a, b) => b.score - a.score);

  console.log('\nRanking Order:');
  deals.forEach((deal, i) => {
    console.log(`  ${i + 1}. ${deal.name} - ${deal.score.toFixed(1)}`);
  });
  console.log('');
}

// ============================================================================
// Run all examples
// ============================================================================

if (require.main === module) {
  example1_BasicRanking();
  example2_TimeDecayComparison();
  example3_BatchProcessing();
  example4_FactorImpact();
  example5_HotDeals();
}

export {
  example1_BasicRanking,
  example2_TimeDecayComparison,
  example3_BatchProcessing,
  example4_FactorImpact,
  example5_HotDeals,
};
