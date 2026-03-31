export async function deliverOtpCode(phone, code) {
  const endpoint = process.env.WHATSAPP_OTP_ENDPOINT;
  const token = process.env.WHATSAPP_OTP_TOKEN;

  if (!endpoint) {
    console.log(`[openclaw-wins] OTP for ${phone}: ${code}`);
    return { ok: true, fallback: true, reason: 'no-whatsapp-endpoint-configured' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      phone,
      message: `קוד ההתחברות שלך ל-OpenClaw Wins הוא: ${code}`,
      code,
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: `delivery failed: ${response.status}` };
  }

  return { ok: true };
}
