import { getSessionFromRequest } from '../../../lib/auth.js';
import { createResponseInSupabase, listResponsesFromSupabase } from '../../../lib/supabase.js';
import { seedResponses } from '../../../lib/seed-responses.js';

const localResponses = new Map(Object.entries(seedResponses));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const winSlug = searchParams.get('win');
  if (!winSlug) return Response.json({ error: 'win is required' }, { status: 400 });

  const remote = await listResponsesFromSupabase(winSlug);
  if (remote.ok) {
    const merged = [...(remote.responses || []), ...(localResponses.get(winSlug) || [])]
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return Response.json({ responses: merged, source: 'supabase+seed' });
  }

  return Response.json({ responses: localResponses.get(winSlug) || [], source: 'seed' });
}

export async function POST(request) {
  const identity = getSessionFromRequest(request);
  if (!identity) {
    return Response.json({ error: 'authentication required' }, { status: 401 });
  }

  const body = await request.json();
  if (!body?.win_slug || !body?.body) {
    return Response.json({ error: 'win_slug and body are required' }, { status: 400 });
  }

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
  return Response.json({ ok: true, response: remote.ok ? remote.response : local, mirrored: remote.ok, mirrorReason: remote.ok ? null : remote.reason });
}
