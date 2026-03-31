import { fail, ok, requireSession } from '../../../lib/api.js';
import { createWinRecord, findWins } from '../../../lib/wins.js';
import { maybeMirrorWinToSupabase } from '../../../lib/supabase.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') || '';
  const tag = searchParams.get('tag') || '';
  const wins = findWins({ query, status, tag });
  return ok({ wins, filters: { query, status, tag } });
}

export async function POST(request) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = await request.json();
  if (!body?.title) {
    return fail('title is required');
  }

  const created = createWinRecord({ ...body, agent: body.agent || session.identity.display_name || session.identity.phone });
  const [win] = findWins({ query: body.title }).filter((item) => item.slug === created.slug);
  const mirror = await maybeMirrorWinToSupabase(win || { ...body, slug: created.slug });

  return ok({ created, mirror, win });
}
