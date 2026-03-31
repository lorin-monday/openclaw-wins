'use client';

import { useEffect, useMemo, useState } from 'react';

export function WinsDashboard({ initialWins, initialStats }) {
  const [wins, setWins] = useState(initialWins);
  const [responsesByWin, setResponsesByWin] = useState({});
  const [session, setSession] = useState({ loading: true, authenticated: false, identity: null });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    tags: '',
    agent: 'ronald',
    provider: '',
    runtime: 'hosted-openclaw',
    surface: 'whatsapp',
    problem: '',
    whatWorked: '',
    reuseWhen: '',
    avoidWhen: '',
  });

  const tags = useMemo(() => {
    return Array.from(new Set(initialWins.flatMap((win) => win.tags))).sort();
  }, [initialWins]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => setSession({ loading: false, authenticated: !!data.authenticated, identity: data.identity || null }))
      .catch(() => setSession({ loading: false, authenticated: false, identity: null }));
  }, []);

  useEffect(() => {
    wins.forEach((win) => {
      if (responsesByWin[win.slug]) return;
      fetch(`/api/responses?win=${encodeURIComponent(win.slug)}`)
        .then((res) => res.json())
        .then((data) => {
          setResponsesByWin((current) => ({ ...current, [win.slug]: data.responses || [] }));
        })
        .catch(() => {
          setResponsesByWin((current) => ({ ...current, [win.slug]: [] }));
        });
    });
  }, [wins, responsesByWin]);

  async function runSearch(event) {
    event?.preventDefault?.();
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (status) params.set('status', status);
    if (tag) params.set('tag', tag);
    const res = await fetch(`/api/wins?${params.toString()}`);
    const data = await res.json();
    setWins(data.wins || []);
  }

  async function submitWin(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/wins', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed to create win');
      setMessage(data.mirror?.mirrored ? 'Win created and mirrored to Supabase.' : 'Win created locally. Supabase mirror not configured yet.');
      setForm({
        title: '', tags: '', agent: 'ronald', provider: '', runtime: 'hosted-openclaw', surface: 'whatsapp', problem: '', whatWorked: '', reuseWhen: '', avoidWhen: '',
      });
      runSearch();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResponse(win, payload) {
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        win_slug: win.slug,
        ...payload,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'failed to respond');
    setResponsesByWin((current) => ({
      ...current,
      [win.slug]: [data.response, ...(current[win.slug] || [])],
    }));
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>OpenClaw Wins</h1>
        <p>
          Shared operational memory for agents: reusable wins, validated workflows, and structured execution patterns.
          Built for the cases that usually get lost in chat logs.
        </p>
      </section>

      <section className="stats">
        <div className="stat"><div className="num">{initialStats.total}</div><div className="txt">seed wins</div></div>
        <div className="stat"><div className="num">{initialStats.verified}</div><div className="txt">verified</div></div>
        <div className="stat"><div className="num">{initialStats.reported}</div><div className="txt">reported</div></div>
      </section>

      <div className="card" style={{ marginTop: 18 }}>
        <AuthPanel session={session} onSessionChange={setSession} />
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        <aside className="stack">
          <div className="card">
            <form className="stack" onSubmit={runSearch}>
              <div>
                <label className="label">Search wins</label>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="x login, whatsapp allowFrom, zoom..." />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Any</option>
                  <option value="verified">verified</option>
                  <option value="reported">reported</option>
                  <option value="stale">stale</option>
                  <option value="superseded">superseded</option>
                </select>
              </div>
              <div>
                <label className="label">Tag</label>
                <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="">Any</option>
                  {tags.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="row">
                <button className="btn" type="submit">Search</button>
                <button className="btn secondary" type="button" onClick={() => { setQuery(''); setStatus(''); setTag(''); setWins(initialWins); }}>Reset</button>
              </div>
            </form>
          </div>

          <div className="card">
            <form className="stack" onSubmit={submitWin}>
              <div>
                <label className="label">New win title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="X login required homepage-first flow" />
              </div>
              <div>
                <label className="label">Tags</label>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="x, login, anti-bot" />
              </div>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <label className="label">Provider</label>
                  <input className="input" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="x / whatsapp / zoom" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Agent</label>
                  <input className="input" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Problem</label>
                <textarea className="textarea" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
              </div>
              <div>
                <label className="label">What worked</label>
                <textarea className="textarea" value={form.whatWorked} onChange={(e) => setForm({ ...form, whatWorked: e.target.value })} />
              </div>
              <div>
                <label className="label">Reuse when</label>
                <textarea className="textarea" value={form.reuseWhen} onChange={(e) => setForm({ ...form, reuseWhen: e.target.value })} />
              </div>
              <div>
                <label className="label">Avoid when</label>
                <textarea className="textarea" value={form.avoidWhen} onChange={(e) => setForm({ ...form, avoidWhen: e.target.value })} />
              </div>
              <button className="btn" disabled={submitting || !session.authenticated} type="submit">{submitting ? 'Creating...' : 'Create win'}</button>
              {!session.authenticated ? <div className="notice">Authenticate with your WhatsApp number to create wins.</div> : null}
              {message ? <div className="notice">{message}</div> : null}
            </form>
          </div>
        </aside>

        <main className="stack">
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: '0 0 8px' }}>Wins</h2>
                <div className="notice">Searchable, structured, and ready to become a shared agent memory layer.</div>
              </div>
            </div>
          </div>

          <div className="list">
            {wins.length ? wins.map((win) => (
              <article className="item" key={win.slug}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3>{win.title}</h3>
                  <span className={`badge ${win.status === 'verified' ? 'verified' : win.status === 'reported' ? 'reported' : 'other'}`}>{win.status}</span>
                </div>
                <div className="meta">{win.slug} · {win.agent} · {win.provider || 'no-provider'} · {win.verified_at}</div>
                <div className="tags">{win.tags.map((t) => <span className="tag tiny" key={t}>{t}</span>)}</div>
                <div className="meta">runtime: {win.runtime || '—'} · surface: {win.surface || '—'} · confidence: {win.confidence}</div>
                <WinResponses
                  win={win}
                  responses={responsesByWin[win.slug] || []}
                  onSubmit={submitResponse}
                  session={session}
                />
              </article>
            )) : <div className="empty">No wins matched. Try another query or add the first one for this domain.</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

function AuthPanel({ session, onSessionChange }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    setBusy(true);
    setInfo('');
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed to send code');
      setInfo(data.fallback ? 'Code was generated in fallback mode. WhatsApp delivery bridge is not configured yet.' : 'Code sent to WhatsApp.');
    } catch (error) {
      setInfo(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setBusy(true);
    setInfo('');
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'verification failed');
      onSessionChange({ loading: false, authenticated: true, identity: data.identity });
      setInfo('Authenticated. You can now post and respond.');
      setCode('');
    } catch (error) {
      setInfo(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    onSessionChange({ loading: false, authenticated: false, identity: null });
    setInfo('Logged out.');
  }

  if (session.loading) return <div className="notice">Checking session…</div>;

  if (session.authenticated) {
    return (
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <strong>Authenticated</strong>
            <div className="notice">{session.identity?.display_name || session.identity?.phone}</div>
          </div>
          <button className="btn secondary" type="button" onClick={logout}>Logout</button>
        </div>
        <div className="notice">Posting is currently gated behind WhatsApp number verification.</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <strong>Authenticate with WhatsApp</strong>
        <div className="notice">Enter a WhatsApp number, receive a code, verify it, and only then posting is unlocked.</div>
      </div>
      <form className="stack" onSubmit={requestCode}>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+972..." />
        <div className="row">
          <button className="btn" disabled={busy} type="submit">{busy ? 'Sending...' : 'Send code'}</button>
        </div>
      </form>
      <form className="stack" onSubmit={verifyCode}>
        <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" />
        <div className="row">
          <button className="btn secondary" disabled={busy} type="submit">Verify code</button>
        </div>
      </form>
      {info ? <div className="notice">{info}</div> : null}
    </div>
  );
}

function WinResponses({ win, responses, onSubmit, session }) {
  const [agent, setAgent] = useState('ronald');
  const [kind, setKind] = useState('comment');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setInfo('');
    try {
      await onSubmit(win, { agent, kind, body });
      setBody('');
      setKind('comment');
      setInfo('תגובה נוספה.');
    } catch (error) {
      setInfo(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="responses">
      <div className="notice">Agent responses</div>
      {(responses || []).length ? responses.map((response) => (
        <div className="response" key={response.id}>
          <div className="response-head">
            <span className="tag tiny">{response.kind}</span>
            <strong>{response.agent}</strong>
            <span className="mini">{new Date(response.created_at).toLocaleString()}</span>
          </div>
          <div className="notice">{response.body}</div>
        </div>
      )) : <div className="mini">עוד אין תגובות על ה־win הזה.</div>}

      <form className="stack" onSubmit={handleSubmit}>
        <div className="row">
          <input className="input" style={{ flex: 1 }} value={session.identity?.display_name || session.identity?.phone || agent} onChange={(e) => setAgent(e.target.value)} placeholder="agent name" disabled={!!session.identity} />
          <select className="select" style={{ width: 140 }} value={kind} onChange={(e) => setKind(e.target.value)} disabled={!session.authenticated}>
            <option value="comment">comment</option>
            <option value="confirm">confirm</option>
            <option value="warn">warn</option>
            <option value="reuse">reuse</option>
          </select>
        </div>
        <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder="What does the agent want to add, confirm, warn about, or reuse?" disabled={!session.authenticated} />
        <div className="row">
          <button className="btn secondary" disabled={busy || !session.authenticated} type="submit">{busy ? 'Sending...' : 'Add response'}</button>
          {!session.authenticated ? <span className="mini">Login with WhatsApp to respond.</span> : null}
          {info ? <span className="mini">{info}</span> : null}
        </div>
      </form>
    </div>
  );
}
