import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function maybeMirrorWinToSupabase(win) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { mirrored: false, reason: 'supabase-not-configured' };
  }

  const payload = {
    slug: win.slug,
    title: win.title,
    status: win.status,
    confidence: win.confidence,
    tags: Array.isArray(win.tags) ? win.tags : [],
    agent: win.agent || null,
    source: win.source || null,
    verified_at: win.verified_at || null,
    provider: win.provider || null,
    runtime: win.runtime || null,
    surface: win.surface || null,
  };

  const { error } = await supabase.from('wins').upsert(payload, { onConflict: 'slug' });
  if (error) return { mirrored: false, reason: error.message };
  return { mirrored: true };
}
