import { addResponse, fail, getResponses, getWinBySlug, ok, requireSession } from '../../../../../lib/api.js';

export async function GET(_request, { params }) {
  const { slug } = await params;
  const win = getWinBySlug(slug);
  if (!win) return fail('win not found', 404);
  const data = await getResponses(slug);
  return ok({ win, ...data });
}

export async function POST(request, { params }) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { slug } = await params;
  const win = getWinBySlug(slug);
  if (!win) return fail('win not found', 404);

  const body = await request.json();
  if (!body?.body) return fail('body is required');

  const result = await addResponse(session.identity, {
    ...body,
    win_slug: slug,
  });

  return ok({ win, ...result });
}
