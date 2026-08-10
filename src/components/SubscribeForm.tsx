import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const INTERESTS = [
  { id: 'films',     label: 'Films & Screenings'  },
  { id: 'events',    label: 'Live Events'          },
  { id: 'educators', label: 'Educator Resources'   },
  { id: 'studio',    label: 'Studio News'          },
];

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

interface Props {
  compact?: boolean;
}

export default function SubscribeForm({ compact = false }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [interests, setInterests] = useState<string[]>([]);

  function toggle(id: string) {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const email = (e.currentTarget.querySelector('#sf-email') as HTMLInputElement)?.value ?? '';
    const region = (e.currentTarget.querySelector('#sf-region') as HTMLSelectElement)?.value ?? '';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, region: region || undefined, interests: interests.length ? interests : undefined }),
      });

      if (res.ok) {
        setStatus('success');
        e.currentTarget.reset();
        setInterests([]);
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

  if (compact) {
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

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="sf-email">Email *</label>
        <input type="email" id="sf-email" required placeholder="you@example.com" />
      </div>

      <div className="form-group">
        <label htmlFor="sf-region">Your state or region <span className="form-optional">(optional)</span></label>
        <select id="sf-region" defaultValue="">
          <option value="">Select…</option>
          <optgroup label="United States">
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Outside the US">
            <option value="International">International</option>
          </optgroup>
        </select>
      </div>

      <div className="form-group">
        <label>I'm interested in <span className="form-optional">(optional)</span></label>
        <div className="interests-grid">
          {INTERESTS.map(({ id, label }) => (
            <label key={id} className={`interest-chip${interests.includes(id) ? ' is-selected' : ''}`}>
              <input type="checkbox" value={id} checked={interests.includes(id)} onChange={() => toggle(id)} />
              {label}
            </label>
          ))}
        </div>
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
