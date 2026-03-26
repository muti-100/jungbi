import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase browser client — use in Client Components ('use client').
 * Creates a new instance per call but Supabase caches the connection internally.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return createBrowserClient(url, anonKey)
}
