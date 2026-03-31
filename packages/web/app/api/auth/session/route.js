import { clearSessionCookieHeader, getSessionFromRequest } from '../../../../lib/auth.js';

export async function GET(request) {
  const identity = getSessionFromRequest(request);
  return Response.json({ authenticated: !!identity, identity });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': clearSessionCookieHeader(),
    },
  });
}
