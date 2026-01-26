# Supabase Client Utilities

This directory contains Supabase client configurations for the Next.js App Router.

## Files

### `client.ts`
Client-side Supabase client for use in Client Components (browser environment).

**Usage:**
```tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()

  // Use supabase client
  const handleFetch = async () => {
    const { data } = await supabase.from('products').select()
    console.log(data)
  }

  return <button onClick={handleFetch}>Fetch Products</button>
}
```

### `server.ts`
Server-side Supabase client for use in Server Components, API routes, and Server Actions.

**Usage in Server Components:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select()

  return <div>{/* Render products */}</div>
}
```

**Usage in Server Actions:**
```tsx
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').insert({
    name: formData.get('name'),
  })

  return { data, error }
}
```

### `middleware.ts`
Auth middleware for session management and route protection (Phase 2).

**Usage:**
Create a `middleware.ts` file in your project root:

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Environment Variables

Required environment variables (add to `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication (Phase 2)

The middleware file includes commented examples for:
- Protected route handling
- Auth redirects
- Session refresh

Uncomment and customize these when implementing authentication.
