# DontBuyTech Setup Guide

## Environment Variables Setup

### Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **Never commit `.env.local`** - it's already in `.gitignore`

### Required Environment Variables

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key for client-side
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only!)

Get these from: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

#### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string for Drizzle ORM

Get this from: Supabase Dashboard → Project Settings → Database → Connection String (use "Direct connection")

#### AI Configuration
- `ANTHROPIC_API_KEY` - Claude AI API key for product analysis

Get this from: [Anthropic Console](https://console.anthropic.com/settings/keys)

#### Application Configuration
- `NEXT_PUBLIC_APP_URL` - Your application URL (e.g., `http://localhost:3000`)
- `NODE_ENV` - Environment mode (`development` | `production` | `test`)

### Security Notes

- **Never commit** `.env`, `.env.local`, or any file containing actual secrets
- **Service Role Key** bypasses Row Level Security - only use server-side
- **Keep your API keys secure** and rotate them if exposed
- The `.env.example` and `.env.local.example` files are safe to commit (contain no secrets)

### File Overview

- `.env.example` - Minimal template with placeholder values
- `.env.local.example` - Detailed template with documentation
- `.env.local` - **Your actual secrets** (create this, never commit)
- `.gitignore` - Configured to protect your secrets

### Getting API Keys

1. **Supabase:**
   - Sign up at https://supabase.com
   - Create a new project
   - Go to Project Settings → API

2. **Anthropic Claude:**
   - Sign up at https://console.anthropic.com
   - Go to Settings → API Keys
   - Create a new key

3. **Database URL:**
   - Available in your Supabase project settings
   - Use the "Direct connection" string for Drizzle ORM

## Next Steps

After setting up your environment variables:

1. Install dependencies: `npm install` or `pnpm install`
2. Run database migrations (once set up)
3. Start development server: `npm run dev`

For more information, see the main [README.md](./README.md)
