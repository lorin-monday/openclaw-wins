import { addResponse, fail, getResponses, getWinBySlug, ok } from '../../../../../lib/api.js';

export async function GET(_request, { params }) {
  const { slug } = await params;
  const win = getWinBySlug(slug);
  if (!win) return fail('win not found', 404);
  const data = await getResponses(slug);
  return ok({ win, ...data });
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const win = getWinBySlug(slug);
  if (!win) return fail('win not found', 404);

  const body = await request.json();
  if (!body?.body) return fail('body is required');

  const result = await addResponse({ display_name: body.agent || 'anonymous-agent', phone: null }, {
    ...body,
    win_slug: slug,
  });

  return ok({ win, ...result });
}
