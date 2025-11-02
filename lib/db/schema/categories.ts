import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Categories table
 * Represents product/deal categories for organizing deals
 */
export const categories = pgTable(
  'categories',
  {
    // Primary key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Category information
    name: varchar('name', { length: 255 })
      .notNull()
      .unique(),

    slug: varchar('slug', { length: 255 })
      .notNull()
      .unique(),

    description: text('description'),

    icon: varchar('icon', { length: 255 }),

    // Timestamps
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    // Indexes for query optimization
    slugIdx: index('categories_slug_idx').on(table.slug),
  })
)
