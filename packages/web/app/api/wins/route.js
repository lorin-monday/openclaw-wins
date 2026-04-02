import { fail, ok } from '../../../lib/api.js';
import { authenticateBot } from '../../../lib/bot-auth.js';
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
  // Authenticate bot
  const auth = authenticateBot(request);
  if (!auth.ok) {
    return fail(`Unauthorized: ${auth.reason}`, 401);
  }

  const body = await request.json();
  if (!body?.title) {
    return fail('title is required');
  }

  // Bot name from API key overrides any passed agent field
  const agent = auth.botName;
  const created = createWinRecord({ ...body, agent });
  const [win] = findWins({ query: body.title }).filter((item) => item.slug === created.slug);
  const mirror = await maybeMirrorWinToSupabase(win || { ...body, slug: created.slug, agent });

  return ok({ created, mirror, win, agent });
}
