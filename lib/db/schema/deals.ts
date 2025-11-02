import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, real, index, vector } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories';

/**
 * Deals table
 * Represents deals/products posted by users
 */
export const deals = pgTable(
  'deals',
  {
    // Primary key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Deal basic information
    title: varchar('title', { length: 500 })
      .notNull(),

    description: text('description')
      .notNull(),

    // Pricing information
    price: decimal('price', { precision: 10, scale: 2 })
      .notNull(),

    original_price: decimal('original_price', { precision: 10, scale: 2 }),

    discount_percentage: integer('discount_percentage'),

    // Deal links and media
    url: varchar('url', { length: 1000 })
      .notNull(),

    image_url: varchar('image_url', { length: 1000 }),

    // Category relationship
    category_id: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),

    // Additional metadata
    brand: varchar('brand', { length: 255 }),

    // Voting and ranking
    score: real('score')
      .notNull()
      .default(0),

    votes_count: integer('votes_count')
      .notNull()
      .default(0),

    // Timestamps
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .default(sql`now()`),

    expires_at: timestamp('expires_at', { mode: 'date', withTimezone: true }),

    // Status
    archived: boolean('archived')
      .notNull()
      .default(false),

    // AI/Semantic search (pgvector)
    embedding: vector('embedding', { dimensions: 1536 }),
  },
  (table) => ({
    // Individual indexes for common queries
    categoryIdx: index('deals_category_id_idx').on(table.category_id),
    archivedIdx: index('deals_archived_idx').on(table.archived),
    scoreIdx: index('deals_score_idx').on(table.score),
    createdAtIdx: index('deals_created_at_idx').on(table.created_at),

    // Composite index for most common query pattern (active deals by category sorted by score)
    activeCategoryScoreIdx: index('deals_active_category_score_idx')
      .on(table.archived, table.category_id, table.score),
  })
)
