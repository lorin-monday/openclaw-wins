import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const port = Number(process.env.PORT || 8787);
const secret = process.env.OTP_BRIDGE_SECRET;

if (!secret) {
  console.error('Missing OTP_BRIDGE_SECRET');
  process.exit(1);
}

const rateLimit = new Map();

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      return json(res, 200, { ok: true, service: 'openclaw-wins-otp-bridge' });
    }

    if (req.method !== 'POST' || req.url !== '/send-otp') {
      return json(res, 404, { error: 'not found' });
    }

    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return json(res, 401, { error: 'unauthorized' });
    }

    const body = await readJson(req);
    const phone = normalizePhone(body.phone);
    const code = String(body.code || '').trim();
    if (!phone || !/^\d{6}$/.test(code)) {
      return json(res, 400, { error: 'invalid phone or code' });
    }

    const hit = rateLimit.get(phone) || [];
    const recent = hit.filter((ts) => Date.now() - ts < 10 * 60 * 1000);
    if (recent.length >= 5) {
      return json(res, 429, { error: 'too many otp sends for this phone' });
    }
    recent.push(Date.now());
    rateLimit.set(phone, recent);

    const message = `קוד ההתחברות שלך ל-OpenClaw Wins הוא: ${code}`;
    const { stdout, stderr } = await execFileAsync('openclaw', [
      'message',
      'send',
      '--channel',
      'whatsapp',
      '--target',
      phone,
      '--message',
      message,
      '--json',
    ]);

    let parsed;
    try { parsed = JSON.parse(stdout); } catch { parsed = { raw: stdout }; }
    return json(res, 200, { ok: true, result: parsed, stderr: stderr || null });
  } catch (error) {
    return json(res, 500, { error: error.message || 'internal error' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`OTP bridge listening on http://0.0.0.0:${port}`);
});

function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '').trim();
}

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}
