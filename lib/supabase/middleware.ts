import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware Supabase client for auth state management
 *
 * This client is used in Next.js middleware to:
 * - Refresh expired auth tokens
 * - Protect routes based on authentication status
 * - Handle auth redirects
 *
 * Currently set up as a placeholder for Phase 2 authentication implementation.
 *
 * To use this in middleware, add to your middleware.ts file:
 * ```typescript
 * import { updateSession } from '@/lib/supabase/middleware'
 * import { NextResponse } from 'next/server'
 * import type { NextRequest } from 'next/server'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * }
 * ```
 *
 * @param request - The incoming Next.js request
 * @returns A NextResponse with updated auth cookies
 */
export async function updateSession(request: NextRequest) {
  // Create a response object to modify
  let response = NextResponse.next({
    request,
  })

  // Create a Supabase client configured for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - this will automatically update cookies
  // Phase 2: Add authentication logic here
  // Example:
  // const { data: { user } } = await supabase.auth.getUser()
  //
  // Protected routes logic:
  // if (!user && request.nextUrl.pathname.startsWith('/protected')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  //
  // Redirect authenticated users away from auth pages:
  // if (user && request.nextUrl.pathname.startsWith('/login')) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return response
}
