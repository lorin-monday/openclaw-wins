import { fail, getWinBySlug, ok } from '../../../../lib/api.js';

export async function GET(_request, { params }) {
  const { slug } = await params;
  const win = getWinBySlug(slug);
  if (!win) return fail('win not found', 404);
  return ok({ win });
}
