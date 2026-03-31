import { createOtpCode, normalizePhone, storeOtpRequest } from '../../../../lib/auth.js';
import { deliverOtpCode } from '../../../../lib/otp-delivery.js';

export async function POST(request) {
  const body = await request.json();
  const phone = normalizePhone(body?.phone);
  if (!phone) return Response.json({ error: 'phone is required' }, { status: 400 });

  const code = createOtpCode();
  const stored = await storeOtpRequest(phone, code);
  if (!stored.ok) return Response.json({ error: stored.reason || 'failed to store code' }, { status: 500 });

  const delivered = await deliverOtpCode(phone, code);
  if (!delivered.ok) return Response.json({ error: delivered.reason || 'failed to send code' }, { status: 500 });

  return Response.json({ ok: true, fallback: !!delivered.fallback, phone });
}
