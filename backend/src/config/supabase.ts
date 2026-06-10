import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] URL or ANON_KEY not configured. Auth endpoints will not work.');
}

// Shared Supabase client for server-side auth operations.
// WebSocket polyfill is needed for Node.js environments without native WS support.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    transport: WebSocket as any
  }
});
