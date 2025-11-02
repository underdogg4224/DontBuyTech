import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
// For migrations and seed scripts
export const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

// For query purposes
const queryClient = postgres(process.env.DATABASE_URL);

// Initialize Drizzle with schema
export const db = drizzle(queryClient, { schema });

// Export types
export type DB = typeof db;
