/**
 * Database Migration Runner
 *
 * This script runs pending Drizzle migrations against the database.
 *
 * Usage:
 *   npm run db:migrate          # Run all pending migrations
 *   tsx lib/db/migrate.ts       # Direct execution via tsx
 *
 * Prerequisites:
 *   - DATABASE_URL must be set in environment (.env.local)
 *   - Supabase database must be accessible
 *   - Migration files must exist in drizzle/migrations/
 *
 * What it does:
 *   1. Connects to PostgreSQL database using DATABASE_URL
 *   2. Creates migrations tracking table if needed
 *   3. Runs all pending migrations in order
 *   4. Closes connection after completion
 *
 * Error handling:
 *   - Validates DATABASE_URL is set
 *   - Catches and displays migration errors
 *   - Ensures database connection is closed
 *   - Exits with appropriate status code
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env.local file');
    console.error('Example: DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres');
    process.exit(1);
  }

  console.log('🔄 Starting database migrations...\n');

  // Create migration connection (single connection for migrations)
  const migrationConnection = postgres(process.env.DATABASE_URL, {
    max: 1,
    onnotice: () => {}, // Suppress NOTICE messages for cleaner output
  });

  try {
    // Initialize Drizzle with migration connection
    const db = drizzle(migrationConnection);

    console.log('📁 Reading migration files from drizzle/migrations/');

    // Run pending migrations
    await migrate(db, {
      migrationsFolder: 'drizzle/migrations',
    });

    console.log('\n✅ Migrations completed successfully!');
    console.log('📊 Database schema is up to date\n');

  } catch (error) {
    console.error('\n❌ Migration failed!');

    if (error instanceof Error) {
      console.error('Error message:', error.message);

      // Provide helpful hints based on common errors
      if (error.message.includes('connect')) {
        console.error('\n💡 Hint: Check your DATABASE_URL and ensure the database is accessible');
      } else if (error.message.includes('permission')) {
        console.error('\n💡 Hint: Ensure the database user has CREATE/ALTER privileges');
      } else if (error.message.includes('syntax')) {
        console.error('\n💡 Hint: There may be a syntax error in the migration SQL');
      }

      console.error('\nStack trace:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }

    process.exit(1);
  } finally {
    // Always close the connection
    await migrationConnection.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations and handle any uncaught errors
runMigrations()
  .then(() => {
    console.log('✨ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error during migration:', error);
    process.exit(1);
  });
