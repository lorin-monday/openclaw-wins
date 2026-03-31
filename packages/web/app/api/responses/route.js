import { addResponse, fail, getResponses, ok, requireSession } from '../../../lib/api.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const winSlug = searchParams.get('win');
  if (!winSlug) return fail('win is required');
  const data = await getResponses(winSlug);
  return ok(data);
}

export async function POST(request) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = await request.json();
  if (!body?.win_slug || !body?.body) {
    return fail('win_slug and body are required');
  }

  const result = await addResponse(session.identity, body);
  return ok(result);
}
