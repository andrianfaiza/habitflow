import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from Vite environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Fail loudly during development when the credentials are missing.
if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    'Missing Supabase credentials. Please set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.',
  )
}

// Single shared Supabase client used across the whole application.
export const supabase = createClient(supabaseUrl, supabasePublishableKey)
