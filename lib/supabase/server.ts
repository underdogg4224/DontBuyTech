import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for use in Server Components, API routes, and Server Actions
 *
 * This client is used in server environments and manages authentication state through cookies.
 * It requires the same environment variables as the client-side version:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public API key
 *
 * The server client automatically handles:
 * - Reading auth tokens from cookies
 * - Writing updated tokens back to cookies
 * - Managing cookie options for security
 *
 * Usage in Server Components:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function MyServerComponent() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('table').select()
 *   // Use data...
 * }
 * ```
 *
 * Usage in Server Actions:
 * ```tsx
 * 'use server'
 *
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function myAction() {
 *   const supabase = await createClient()
 *   // Perform action...
 * }
 * ```
 *
 * @returns A promise that resolves to a Supabase client configured for server usage
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )
}
