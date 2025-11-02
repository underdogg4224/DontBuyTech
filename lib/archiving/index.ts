/**
 * Archiving Module
 * Exports all archiving utilities for deal archiving based on quality, expiration, and link validity
 */

// Export link checker utilities
export {
  checkDealLink,
  checkMultipleLinks,
  type LinkCheckResult,
} from './link-checker';

// Export archiving logic
export {
  shouldArchiveDeal,
  archiveDeal,
  unarchiveDeal,
  getArchivableDeals,
  checkAndArchiveBrokenLinks,
  archiveEligibleDeals,
  getArchivingStats,
  type ArchiveDecision,
} from './logic';
