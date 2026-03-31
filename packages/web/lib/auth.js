import crypto from 'node:crypto';
import { parse } from 'cookie';
import { getSupabaseAdmin } from './supabase.js';

const SESSION_COOKIE = 'ocw_session';
const sessionStore = new Map();

export function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '').trim();
}

export function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashCode(phone, code) {
  return crypto.createHash('sha256').update(`${normalizePhone(phone)}:${code}`).digest('hex');
}

export async function storeOtpRequest(phone, code) {
  const supabase = getSupabaseAdmin();
  const normalized = normalizePhone(phone);
  const codeHash = hashCode(normalized, code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  if (!supabase) {
    sessionStore.set(`otp:${normalized}`, { codeHash, expiresAt, attempts: 0 });
    return { ok: true, fallback: true, expiresAt };
  }

  const { error } = await supabase.from('auth_requests').insert({
    phone: normalized,
    code_hash: codeHash,
    expires_at: expiresAt,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, expiresAt };
}

export async function verifyOtpRequest(phone, code) {
  const supabase = getSupabaseAdmin();
  const normalized = normalizePhone(phone);
  const codeHash = hashCode(normalized, code);

  if (!supabase) {
    const current = sessionStore.get(`otp:${normalized}`);
    if (!current) return { ok: false, reason: 'no pending code' };
    if (new Date(current.expiresAt).getTime() < Date.now()) return { ok: false, reason: 'code expired' };
    if (current.codeHash !== codeHash) return { ok: false, reason: 'invalid code' };
    return upsertIdentity(normalized);
  }

  const { data, error } = await supabase
    .from('auth_requests')
    .select('id, code_hash, expires_at, attempts, consumed_at')
    .eq('phone', normalized)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, reason: error.message };
  if (!data) return { ok: false, reason: 'no pending code' };
  if (new Date(data.expires_at).getTime() < Date.now()) return { ok: false, reason: 'code expired' };
  if (data.code_hash !== codeHash) {
    await supabase.from('auth_requests').update({ attempts: (data.attempts || 0) + 1 }).eq('id', data.id);
    return { ok: false, reason: 'invalid code' };
  }

  await supabase.from('auth_requests').update({ consumed_at: new Date().toISOString() }).eq('id', data.id);
  return upsertIdentity(normalized);
}

async function upsertIdentity(phone) {
  const supabase = getSupabaseAdmin();
  const identity = { phone, display_name: phone };
  if (!supabase) return { ok: true, identity };

  const { data, error } = await supabase
    .from('identities')
    .upsert(identity, { onConflict: 'phone' })
    .select('id, phone, display_name')
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, identity: data };
}

export function createSession(identity) {
  const token = crypto.randomUUID();
  sessionStore.set(`session:${token}`, { identity, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  return token;
}

export function getSessionFromRequest(request) {
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const session = sessionStore.get(`session:${token}`);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(`session:${token}`);
    return null;
  }
  return session.identity;
}

export function sessionCookieHeader(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Secure`;
}

export function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}
