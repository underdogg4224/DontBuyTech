# Database Configuration - Drizzle ORM

This directory contains the database configuration and schema definitions for DontBuyTech using Drizzle ORM with PostgreSQL/Supabase.

## Structure

```
lib/db/
├── index.ts          # Database client initialization
├── schema/           # Database schema definitions
│   ├── index.ts      # Schema exports
│   ├── deals.ts      # Deals table schema
│   ├── votes.ts      # Votes table schema
│   └── categories.ts # Categories table schema
└── README.md         # This file
```

## Setup

1. **Environment Variables**: Copy `.env.local.example` to `.env.local` and fill in your Supabase DATABASE_URL:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:6543/postgres
   ```

2. **Schema Definition**: Define your tables in the schema files (deals.ts, votes.ts, categories.ts)

3. **Generate Migrations**:
   ```bash
   npm run db:generate
   ```

4. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly (dev only)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Migration Guide

### Understanding Migrations

Migrations are SQL scripts that manage database schema changes over time. Each migration file represents a snapshot of schema changes and can be applied to bring the database up to date.

### Migration Workflow

1. **Modify Schema**: Update table definitions in `lib/db/schema/*.ts`
2. **Generate Migration**: Run `npm run db:generate` to create migration SQL
3. **Review Migration**: Check the generated SQL in `drizzle/migrations/`
4. **Run Migration**: Execute `npm run db:migrate` to apply changes
5. **Commit**: Add migration files to version control

### Initial Database Setup

When setting up a new database (Supabase or local PostgreSQL):

```bash
# 1. Ensure DATABASE_URL is set in .env.local
# 2. Run migrations to create all tables
npm run db:migrate

# 3. Verify with Drizzle Studio
npm run db:studio
```

### Migration File Structure

Migration files are located in `drizzle/migrations/` and follow this naming pattern:
```
0000_jittery_firestar.sql
0001_next_migration.sql
```

Each migration contains:
- Table creation/modification statements
- Index creation
- Constraint definitions
- Foreign key relationships

### The migrate.ts Script

The migration runner (`lib/db/migrate.ts`) performs these steps:

1. Validates DATABASE_URL environment variable
2. Connects to PostgreSQL with a single connection
3. Creates migrations tracking table (if first run)
4. Runs all pending migrations in order
5. Closes connection and reports status

### Troubleshooting Migrations

**Error: DATABASE_URL is not set**
```bash
# Add to .env.local:
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres
```

**Error: Connection refused**
- Check Supabase is running and accessible
- Verify host, port, and credentials in DATABASE_URL
- Ensure firewall allows port 6543

**Error: Permission denied**
- Database user needs CREATE, ALTER, DROP privileges
- Supabase postgres user should have these by default

**Error: Migration already applied**
- This is safe - Drizzle tracks applied migrations
- No action needed if migration was successful previously

### Best Practices

1. **Always generate migrations** - Don't edit the database manually
2. **Review SQL before running** - Check generated migrations for correctness
3. **Test locally first** - Run migrations on local/staging before production
4. **Commit migrations** - Add migration files to git with schema changes
5. **Never edit applied migrations** - Create new migrations for changes
6. **Backup before migrating** - Take database backup before production migrations

## Usage

Import the database client in your application:

```typescript
import { db } from '@/lib/db';

// Example query
const deals = await db.query.deals.findMany();
```

## Connection Configuration

- **Query Client**: Used for standard database queries with connection pooling
- **Migration Client**: Dedicated single connection for running migrations
- **Environment**: Automatically detects development/production from NODE_ENV

## Next Steps

1. Define table schemas in the schema files
2. Generate initial migrations
3. Run migrations to create database tables
4. Start building queries and mutations
