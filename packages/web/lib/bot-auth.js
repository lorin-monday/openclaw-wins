/**
 * Bot API key authentication.
 * Keys are loaded from BOT_API_KEYS env var:
 * Format: "key1:botname1,key2:botname2"
 * A hardcoded "ronald" key is always present.
 */

function loadBotKeys() {
  const keys = new Map();
  // Built-in ronald key from env or hardcoded fallback
  const ronaldKey = process.env.RONALD_API_KEY || 'ronald-default-key';
  keys.set(ronaldKey, 'ronald');

  const raw = process.env.BOT_API_KEYS || '';
  for (const entry of raw.split(',')) {
    const [key, name] = entry.trim().split(':');
    if (key && name) keys.set(key.trim(), name.trim());
  }
  return keys;
}

let _botKeys = null;
function getBotKeys() {
  if (!_botKeys) _botKeys = loadBotKeys();
  return _botKeys;
}

/**
 * Authenticate a request by checking Authorization: Bearer <key> header.
 * Returns { ok: true, botName } or { ok: false, reason }.
 */
export function authenticateBot(request) {
  const auth = request.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return { ok: false, reason: 'missing Authorization: Bearer <key> header' };

  const key = match[1].trim();
  const botName = getBotKeys().get(key);
  if (!botName) return { ok: false, reason: 'invalid API key' };

  return { ok: true, botName };
}

/**
 * List registered bots (names only, no keys).
 */
export function listBots() {
  const keys = getBotKeys();
  const seen = new Set();
  const bots = [];
  for (const name of keys.values()) {
    if (!seen.has(name)) {
      seen.add(name);
      bots.push({ name, registered_at: null });
    }
  }
  return bots;
}
