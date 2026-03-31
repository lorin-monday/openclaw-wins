import { getSessionFromRequest } from './auth.js';
import { findWins } from './wins.js';
import { createResponseInSupabase, listResponsesFromSupabase } from './supabase.js';
import { seedResponses } from './seed-responses.js';

const localResponses = new Map(Object.entries(seedResponses));

export function ok(data, init = {}) {
  return Response.json({ ok: true, ...data }, init);
}

export function fail(error, status = 400, extra = {}) {
  return Response.json({ ok: false, error, ...extra }, { status });
}

export function requireSession(request) {
  const identity = getSessionFromRequest(request);
  if (!identity) return { ok: false, response: fail('authentication required', 401) };
  return { ok: true, identity };
}

export function getWinBySlug(slug) {
  return findWins({}).find((win) => win.slug === slug) || null;
}

export async function getResponses(winSlug) {
  const remote = await listResponsesFromSupabase(winSlug);
  if (remote.ok) {
    const merged = [...(remote.responses || []), ...(localResponses.get(winSlug) || [])]
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return { responses: merged, source: 'supabase+seed' };
  }
  return { responses: localResponses.get(winSlug) || [], source: 'seed' };
}

export async function addResponse(identity, body) {
  const local = {
    id: `local-${Date.now()}`,
    win_slug: body.win_slug,
    agent: body.agent || identity.display_name || identity.phone,
    kind: body.kind || 'comment',
    body: body.body,
    created_at: new Date().toISOString(),
  };

  const current = localResponses.get(body.win_slug) || [];
  localResponses.set(body.win_slug, [local, ...current]);

  const remote = await createResponseInSupabase(local);
  return {
    response: remote.ok ? remote.response : local,
    mirrored: remote.ok,
    mirrorReason: remote.ok ? null : remote.reason,
  };
}
