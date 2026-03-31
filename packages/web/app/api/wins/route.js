import { createWinRecord, findWins } from '../../../lib/wins.js';
import { maybeMirrorWinToSupabase } from '../../../lib/supabase.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') || '';
  const tag = searchParams.get('tag') || '';
  const wins = findWins({ query, status, tag });
  return Response.json({ wins });
}

export async function POST(request) {
  const body = await request.json();
  if (!body?.title) {
    return Response.json({ error: 'title is required' }, { status: 400 });
  }

  const created = createWinRecord(body);
  const [win] = findWins({ query: body.title }).filter((item) => item.slug === created.slug);
  const mirror = await maybeMirrorWinToSupabase(win || { ...body, slug: created.slug });

  return Response.json({ ok: true, created, mirror, win });
}
