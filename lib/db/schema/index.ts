/**
 * Schema exports and relations
 * Central export point for all database tables and their relationships
 */

import { relations } from 'drizzle-orm';
import { categories } from './categories';
import { deals } from './deals';
import { votes } from './votes';

// Export all tables
export { categories } from './categories';
export { deals } from './deals';
export { votes } from './votes';

/**
 * Relations definition
 * Defines the relationships between tables for Drizzle's relational query API
 */

// Categories relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  deals: many(deals),
}));

// Deals relations
export const dealsRelations = relations(deals, ({ one, many }) => ({
  category: one(categories, {
    fields: [deals.category_id],
    references: [categories.id],
  }),
  votes: many(votes),
}));

// Votes relations
export const votesRelations = relations(votes, ({ one }) => ({
  deal: one(deals, {
    fields: [votes.deal_id],
    references: [deals.id],
  }),
}));
