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

export async function listResponsesFromSupabase(winSlug) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: 'supabase-not-configured', responses: [] };
  const { data, error } = await supabase
    .from('win_responses')
    .select('id, win_slug, agent, kind, body, created_at')
    .eq('win_slug', winSlug)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, reason: error.message, responses: [] };
  return { ok: true, responses: data || [] };
}

export async function createResponseInSupabase(response) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: 'supabase-not-configured' };
  const payload = {
    win_slug: response.win_slug,
    agent: response.agent,
    kind: response.kind,
    body: response.body,
  };
  const { data, error } = await supabase
    .from('win_responses')
    .insert(payload)
    .select('id, win_slug, agent, kind, body, created_at')
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, response: data };
}
