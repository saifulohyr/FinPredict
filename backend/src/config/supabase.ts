import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is not configured. Manual auth endpoints will not work.');
}

/**
 * Supabase client instance for server-side operations (signup, signin).
 * Uses the anon key — safe for auth operations where the user provides credentials.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
