import { createSession, sessionCookieHeader, verifyOtpRequest } from '../../../../lib/auth.js';

export async function POST(request) {
  const body = await request.json();
  const verified = await verifyOtpRequest(body?.phone, body?.code);
  if (!verified.ok) return Response.json({ error: verified.reason || 'verification failed' }, { status: 400 });

  const token = createSession(verified.identity);
  return new Response(JSON.stringify({ ok: true, identity: verified.identity }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': sessionCookieHeader(token),
    },
  });
}
