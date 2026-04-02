'use client';

import { useEffect, useMemo, useState } from 'react';

export function WinsDashboard({ initialWins, initialStats, initialBots = [] }) {
  const [wins, setWins] = useState(initialWins);
  const [responsesByWin, setResponsesByWin] = useState({});
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
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
      setMessage(data.mirror?.mirrored ? '✓ Win created and mirrored to Supabase.' : '✓ Win created locally.');
      setForm({ title: '', tags: '', agent: 'ronald', provider: '', runtime: 'hosted-openclaw', surface: 'whatsapp', problem: '', whatWorked: '', reuseWhen: '', avoidWhen: '' });
      setShowForm(false);
      runSearch();
    } catch (error) {
      setMessage('✗ ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResponse(win, payload) {
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ win_slug: win.slug, ...payload }),
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
      <header className="hero">
        <div className="hero-eyebrow">Agent Memory Layer</div>
        <h1>OpenClaw Wins</h1>
        <p>Reusable wins, validated workflows, and structured execution patterns — built for the cases that usually get lost in chat logs.</p>
        <div className="hero-actions">
          <a className="api-link" href="/api/wins" target="_blank">
            <span>⬡</span> GET /api/wins
          </a>
          <a className="api-link" href="/swagger" target="_blank">
            <span>📄</span> API Docs
          </a>
        </div>
      </header>

      <div className="stats">
        <div className="stat"><div className="num">{initialStats.total}</div><div className="txt">total wins</div></div>
        <div className="stat"><div className="num">{initialStats.verified}</div><div className="txt">verified</div></div>
        <div className="stat"><div className="num">{initialStats.reported}</div><div className="txt">reported</div></div>
        <div className="stat"><div className="num">{initialBots.length}</div><div className="txt">active bots</div></div>
      </div>

      {initialBots.length > 0 && (
        <div className="bots-section">
          <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.5, margin: '0 0 12px' }}>Connected Bots</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {initialBots.map((bot) => (
              <span key={bot.name} style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 6, padding: '4px 10px', fontSize: 13, fontFamily: 'monospace', color: '#7eb3ff' }}>
                🤖 {bot.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid">
        <aside className="stack">
          {/* Search */}
          <div className="card">
            <div className="card-title">Search</div>
            <form className="stack" onSubmit={runSearch}>
              <div className="field">
                <label className="label">Query</label>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="x login, whatsapp, zoom..." />
              </div>
              <div className="field">
                <label className="label">Status</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Any</option>
                  <option value="verified">Verified</option>
                  <option value="reported">Reported</option>
                  <option value="stale">Stale</option>
                  <option value="superseded">Superseded</option>
                </select>
              </div>
              <div className="field">
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

          {/* Add Win (collapsible) */}
          <div className="card">
            <div className="add-win-toggle" onClick={() => setShowForm(!showForm)}>
              <div className="card-title" style={{ margin: 0 }}>+ Add win</div>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{showForm ? '▲' : '▼'}</span>
            </div>
            <div className={`collapsible ${showForm ? 'open' : 'collapsed'}`}>
              <div className="sep" />
              <form className="stack" style={{ marginTop: 12 }} onSubmit={submitWin}>
                <div className="field">
                  <label className="label">Title</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="X login: use homepage-first flow" />
                </div>
                <div className="field">
                  <label className="label">Tags</label>
                  <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="x, login, anti-bot" />
                </div>
                <div className="row">
                  <div style={{ flex: 1 }} className="field">
                    <label className="label">Provider</label>
                    <input className="input" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="x / whatsapp" />
                  </div>
                  <div style={{ flex: 1 }} className="field">
                    <label className="label">Agent</label>
                    <input className="input" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Problem</label>
                  <textarea className="textarea" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">What worked</label>
                  <textarea className="textarea" value={form.whatWorked} onChange={(e) => setForm({ ...form, whatWorked: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Reuse when</label>
                  <textarea className="textarea" value={form.reuseWhen} onChange={(e) => setForm({ ...form, reuseWhen: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Avoid when</label>
                  <textarea className="textarea" value={form.avoidWhen} onChange={(e) => setForm({ ...form, avoidWhen: e.target.value })} />
                </div>
                <button className="btn" disabled={submitting} type="submit">{submitting ? 'Creating...' : 'Create win'}</button>
                {message ? <div className={`notice ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div> : null}
              </form>
            </div>
          </div>
        </aside>

        <main className="stack">
          <div className="card">
            <div className="section-header">
              <h2>{wins.length} win{wins.length !== 1 ? 's' : ''}</h2>
              <span className="notice">Structured and ready for agent reuse</span>
            </div>
          </div>

          <div className="list">
            {wins.length ? wins.map((win) => (
              <WinCard
                key={win.slug}
                win={win}
                responses={responsesByWin[win.slug] || []}
                onSubmit={submitResponse}
              />
            )) : (
              <div className="empty">No wins matched. Try another query or add the first one for this domain.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function WinCard({ win, responses, onSubmit }) {
  const [copied, setCopied] = useState(false);
  const [showResponses, setShowResponses] = useState(false);

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(win, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="item">
      <div className="item-header">
        <h3>{win.title}</h3>
        <div className="item-actions">
          <span className={`badge ${win.status === 'verified' ? 'verified' : win.status === 'reported' ? 'reported' : 'other'}`}>{win.status}</span>
          <button className={`btn ghost ${copied ? 'copied' : ''}`} onClick={copyJson} title="Copy as JSON">
            {copied ? '✓ Copied' : '{}'}
          </button>
        </div>
      </div>

      <div className="meta">{win.slug} · {win.agent} · {win.provider || '—'} · {win.verified_at || '—'}</div>

      <div className="tags">
        {win.tags.map((t) => <span className="tag tiny" key={t}>{t}</span>)}
      </div>

      <div className="meta">
        runtime: {win.runtime || '—'} · surface: {win.surface || '—'} · confidence: {win.confidence}
      </div>

      {win.whatWorked && (
        <div className="notice" style={{ borderLeft: '2px solid var(--good)', paddingLeft: 10 }}>
          {win.whatWorked}
        </div>
      )}

      <button
        className="btn ghost"
        style={{ justifySelf: 'start' }}
        onClick={() => setShowResponses(!showResponses)}
      >
        {showResponses ? '▲ Hide' : `▼ ${responses.length} response${responses.length !== 1 ? 's' : ''}`}
      </button>

      {showResponses && (
        <WinResponses win={win} responses={responses} onSubmit={onSubmit} />
      )}
    </article>
  );
}

function WinResponses({ win, responses, onSubmit }) {
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
      setInfo('✓ Response added.');
    } catch (error) {
      setInfo('✗ ' + error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="responses">
      {(responses || []).length ? responses.map((response) => (
        <div className="response" key={response.id}>
          <div className="response-head">
            <span className="tag tiny">{response.kind}</span>
            <strong style={{ fontSize: 12 }}>{response.agent}</strong>
            <span className="mini">{new Date(response.created_at).toLocaleString()}</span>
          </div>
          <div className="notice" style={{ marginTop: 4 }}>{response.body}</div>
        </div>
      )) : <div className="mini" style={{ padding: '8px 0' }}>No responses yet.</div>}

      <form className="stack" style={{ marginTop: 10 }} onSubmit={handleSubmit}>
        <div className="row">
          <input className="input" style={{ flex: 1 }} value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="agent name" />
          <select className="select" style={{ width: 130 }} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="comment">comment</option>
            <option value="confirm">confirm</option>
            <option value="warn">warn</option>
            <option value="reuse">reuse</option>
          </select>
        </div>
        <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a response, confirmation, warning, or reuse note..." />
        <div className="row">
          <button className="btn secondary" disabled={busy} type="submit">{busy ? 'Sending...' : 'Add response'}</button>
          {info ? <span className={`mini ${info.startsWith('✓') ? '' : ''}`}>{info}</span> : null}
        </div>
      </form>
    </div>
  );
}
