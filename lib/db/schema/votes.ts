import { pgTable, uuid, varchar, timestamp, integer, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { deals } from './deals';

/**
 * Votes table
 * Represents user votes (upvotes/downvotes) on deals
 */
export const votes = pgTable(
  'votes',
  {
    // Primary key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Deal relationship (cascade delete when deal is deleted)
    deal_id: uuid('deal_id')
      .notNull()
      .references(() => deals.id, { onDelete: 'cascade' }),

    // User relationship (nullable for now, will be proper FK in Phase 4 with auth)
    user_id: varchar('user_id', { length: 255 })
      .notNull(),

    // Vote type: 1 for upvote, -1 for downvote
    vote_type: integer('vote_type')
      .notNull(),

    // Timestamp
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    // Indexes for query optimization
    dealIdIdx: index('votes_deal_id_idx').on(table.deal_id),
    userIdIdx: index('votes_user_id_idx').on(table.user_id),

    // Unique constraint: one vote per user per deal
    uniqueUserDealVote: unique('unique_user_deal_vote').on(table.deal_id, table.user_id),
  })
)
