'use client';
import { useState } from 'react';

export default function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const next = new URLSearchParams(location.search).get('next');
      location.href = next && next.startsWith('/admin') ? next : '/admin';
    } else {
      setError((await res.json().catch(() => ({}))).error || 'Login failed');
      setBusy(false);
    }
  }
  return (
    <div className="a-login">
      <div className="a-login-art">
        <span className="mono" style={{ color: '#8f8a80' }}>
          Studio CMS
        </span>
        <h1>
          Shape every
          <br />
          <em>pixel</em> of
          <br />
          your space.
        </h1>
        <span className="mono" style={{ color: '#8f8a80' }}>
          Pages · Products · 3D · Theme · Inquiries
        </span>
      </div>
      <div className="a-login-form">
        <form onSubmit={submit}>
          <div>
            <h1>Sign in</h1>
            <p className="muted">Welcome back to the studio dashboard.</p>
          </div>
          <label className="f-field">
            <span className="f-label">Email</span>
            <input name="email" type="email" required autoComplete="username" autoFocus />
          </label>
          <label className="f-field">
            <span className="f-label">Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          {error && <p style={{ color: 'var(--a-danger)', margin: 0 }}>{error}</p>}
          <button className="a-btn primary" style={{ height: 44, justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>
          <a href="/" className="muted" style={{ textAlign: 'center' }}>
            ← Back to website
          </a>
        </form>
      </div>
    </div>
  );
}
