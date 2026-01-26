'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

/**
 * Deal statistics interface
 */
interface DealStatistics {
  total: number;
  summarized: number;
  unsummarized: number;
  averageQualityScore: number | null;
  lastSummarizedAt: string | null;
}

/**
 * Unsummarized deal interface
 */
interface UnsummarizedDeal {
  id: string;
  title: string;
  price: string;
  discount_percentage: number | null;
  created_at: Date;
}

/**
 * Individual deal result from API
 */
interface DealSummaryResult {
  dealId: string;
  success: boolean;
  summary?: string;
  aiQualityScore?: number;
  tags?: string[];
  priceDropSignificance?: 'high' | 'medium' | 'low' | 'none';
  scoreBreakdown?: {
    authenticityScore: number;
    priceDropScore: number;
    relevanceScore: number;
    descriptionQualityScore: number;
  };
  reasoning?: string;
  summarizedAt?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Batch response from API
 */
interface BatchSummarizeResponse {
  total: number;
  successful: number;
  failed: number;
  results: DealSummaryResult[];
}

/**
 * Component props
 */
interface SummarizationClientProps {
  initialStatistics: DealStatistics;
  initialUnsummarizedDeals: UnsummarizedDeal[];
}

/**
 * Get color for quality score badge
 */
function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500 hover:bg-green-600';
  if (score >= 60) return 'bg-blue-500 hover:bg-blue-600';
  if (score >= 40) return 'bg-yellow-500 hover:bg-yellow-600';
  if (score >= 20) return 'bg-orange-500 hover:bg-orange-600';
  return 'bg-red-500 hover:bg-red-600';
}

/**
 * Get color for price drop significance
 */
function getPriceDropColor(significance: string): string {
  switch (significance) {
    case 'high':
      return 'bg-green-500 hover:bg-green-600';
    case 'medium':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'low':
      return 'bg-gray-500 hover:bg-gray-600';
    case 'none':
    default:
      return 'bg-gray-400 hover:bg-gray-500';
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Client component for AI summarization interface
 */
export function SummarizationClient({
  initialStatistics,
  initialUnsummarizedDeals,
}: SummarizationClientProps) {
  const [statistics, setStatistics] = useState<DealStatistics>(initialStatistics);
  const [unsummarizedDeals, setUnsummarizedDeals] = useState<UnsummarizedDeal[]>(initialUnsummarizedDeals);
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [results, setResults] = useState<DealSummaryResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Toggle deal selection
   */
  const toggleDealSelection = useCallback((dealId: string) => {
    setSelectedDealIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  }, []);

  /**
   * Select all deals
   */
  const selectAllDeals = useCallback(() => {
    setSelectedDealIds(new Set(unsummarizedDeals.map(d => d.id)));
  }, [unsummarizedDeals]);

  /**
   * Deselect all deals
   */
  const deselectAllDeals = useCallback(() => {
    setSelectedDealIds(new Set());
  }, []);

  /**
   * Process batch of deals
   */
  const processBatch = async (dealIds: string[]): Promise<BatchSummarizeResponse> => {
    const response = await fetch('/api/ai/summarize/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dealIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  };

  /**
   * Start batch summarization
   */
  const startSummarization = async () => {
    const dealsToProcess = selectedDealIds.size > 0
      ? Array.from(selectedDealIds)
      : unsummarizedDeals.map(d => d.id);

    if (dealsToProcess.length === 0) {
      setError('No deals to process');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults([]);
    setProgress(0);

    try {
      // Split into batches of 10
      const BATCH_SIZE = 10;
      const batches: string[][] = [];
      for (let i = 0; i < dealsToProcess.length; i += BATCH_SIZE) {
        batches.push(dealsToProcess.slice(i, i + BATCH_SIZE));
      }

      setTotalBatches(batches.length);
      const allResults: DealSummaryResult[] = [];

      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        setCurrentBatch(i + 1);
        const batch = batches[i];

        try {
          const batchResponse = await processBatch(batch);
          allResults.push(...batchResponse.results);

          // Update progress
          const processedCount = (i + 1) * BATCH_SIZE;
          const progressPercent = Math.min(
            100,
            Math.round((processedCount / dealsToProcess.length) * 100)
          );
          setProgress(progressPercent);
        } catch (batchError) {
          console.error(`Error processing batch ${i + 1}:`, batchError);
          // Add error results for this batch
          const errorResults: DealSummaryResult[] = batch.map(dealId => ({
            dealId,
            success: false,
            error: {
              code: 'BATCH_ERROR',
              message: batchError instanceof Error ? batchError.message : 'Unknown error',
            },
          }));
          allResults.push(...errorResults);
        }
      }

      setResults(allResults);
      setProgress(100);

      // Refresh statistics
      await refreshData();

    } catch (err) {
      console.error('Error in batch summarization:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Refresh statistics and unsummarized deals
   */
  const refreshData = async () => {
    try {
      // Reload the page to get fresh data
      window.location.reload();
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Summarized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {statistics.summarized}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Unsummarized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {statistics.unsummarized}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.averageQualityScore !== null
                ? Math.round(statistics.averageQualityScore)
                : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last Summarized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(statistics.lastSummarizedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Unsummarized Deals ({unsummarizedDeals.length})</CardTitle>
          <CardDescription>
            Select specific deals or click "Summarize All" to process all unsummarized deals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={startSummarization}
              disabled={isProcessing || unsummarizedDeals.length === 0}
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Summarize All'}
            </Button>

            {selectedDealIds.size > 0 && (
              <Button
                onClick={startSummarization}
                disabled={isProcessing}
                variant="outline"
                size="lg"
              >
                Summarize Selected ({selectedDealIds.size})
              </Button>
            )}

            {unsummarizedDeals.length > 0 && (
              <>
                <Button
                  onClick={selectAllDeals}
                  disabled={isProcessing}
                  variant="outline"
                  size="lg"
                >
                  Select All
                </Button>

                {selectedDealIds.size > 0 && (
                  <Button
                    onClick={deselectAllDeals}
                    disabled={isProcessing}
                    variant="ghost"
                    size="lg"
                  >
                    Deselect All
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processing batch {currentBatch} of {totalBatches} ({progress}% complete)
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}

          {/* Deal List */}
          {unsummarizedDeals.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {unsummarizedDeals.map(deal => (
                <label
                  key={deal.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDealIds.has(deal.id)}
                    onChange={() => toggleDealSelection(deal.id)}
                    disabled={isProcessing}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {deal.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${deal.price}
                      </span>
                      {deal.discount_percentage && (
                        <Badge variant="secondary" className="text-xs">
                          {deal.discount_percentage}% off
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">All deals have been summarized!</p>
              <p className="text-sm mt-1">Check back later for new deals.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              {successCount} successful, {failedCount} failed out of {results.length} total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-semibold">{successCount}</span> successful
                </p>
              </div>
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <span className="font-semibold">{failedCount}</span> failed
                </p>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.dealId}-${index}`}
                  className={`p-4 border rounded-lg ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}
                >
                  {result.success ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Deal ID: {result.dealId.substring(0, 8)}...
                          </p>
                          {result.summary && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {result.summary}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {result.aiQualityScore !== undefined && (
                            <Badge className={getQualityScoreColor(result.aiQualityScore)}>
                              Score: {result.aiQualityScore}
                            </Badge>
                          )}
                          {result.priceDropSignificance && (
                            <Badge className={getPriceDropColor(result.priceDropSignificance)}>
                              {result.priceDropSignificance}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Score Breakdown */}
                      {result.scoreBreakdown && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Authenticity: </span>
                            <span className="font-semibold">{result.scoreBreakdown.authenticityScore}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Price Drop: </span>
                            <span className="font-semibold">{result.scoreBreakdown.priceDropScore}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Relevance: </span>
                            <span className="font-semibold">{result.scoreBreakdown.relevanceScore}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Quality: </span>
                            <span className="font-semibold">{result.scoreBreakdown.descriptionQualityScore}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Failed: {result.dealId.substring(0, 8)}...
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {result.error.code}: {result.error.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
