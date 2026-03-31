'use client';

import { useMemo, useState } from 'react';

export function WinsDashboard({ initialWins, initialStats }) {
  const [wins, setWins] = useState(initialWins);
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
              <button className="btn" disabled={submitting} type="submit">{submitting ? 'Creating...' : 'Create win'}</button>
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
                <div className="tags">{win.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                <div className="meta">runtime: {win.runtime || '—'} · surface: {win.surface || '—'} · confidence: {win.confidence}</div>
              </article>
            )) : <div className="empty">No wins matched. Try another query or add the first one for this domain.</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
