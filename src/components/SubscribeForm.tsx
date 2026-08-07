import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SubscribeForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const email = (e.currentTarget.querySelector('#sf-email') as HTMLInputElement)?.value ?? '';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        e.currentTarget.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="form-success">
        <p className="form-success-headline">You're in.</p>
        <p className="form-success-body">We'll keep you posted.</p>
        <button className="btn btn-outline" onClick={() => setStatus('idle')}>Sign up another</button>
      </div>
    );
  }

  return (
    <form className="contact-form subscribe-inline" onSubmit={handleSubmit}>
      <div className="form-group">
        <input type="email" id="sf-email" required placeholder="you@example.com" />
      </div>

      {status === 'error' && (
        <p className="form-error">Something went wrong. Please try again.</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing up…' : 'Subscribe'}
      </button>
    </form>
  );
}
