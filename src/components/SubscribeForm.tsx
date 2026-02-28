import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const INTERESTS = [
  { id: 'films',     label: 'Films & Screenings'  },
  { id: 'events',    label: 'Events & Activations' },
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

export default function SubscribeForm() {
  const [status, setStatus]       = useState<Status>('idle');
  const [interests, setInterests] = useState<string[]>([]);

  function toggle(id: string) {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const f = e.currentTarget;
    const get = (id: string) => (f.querySelector(`#sf-${id}`) as HTMLInputElement | HTMLSelectElement)?.value ?? '';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: get('first-name'),
          email:     get('email'),
          region:    get('region'),
          interests,
        }),
      });

      if (res.ok) {
        setStatus('success');
        f.reset();
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
        <p className="form-success-body">We'll reach out with updates that matter to you.</p>
        <button className="btn btn-outline" onClick={() => setStatus('idle')}>Sign up another</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="sf-first-name">First Name *</label>
        <input type="text" id="sf-first-name" required placeholder="First" />
      </div>

      <div className="form-group">
        <label htmlFor="sf-email">Email *</label>
        <input type="email" id="sf-email" required placeholder="you@example.com" />
      </div>

      <div className="form-group">
        <label>I'm interested in</label>
        <div className="interests-grid">
          {INTERESTS.map(({ id, label }) => (
            <label key={id} className={`interest-chip${interests.includes(id) ? ' is-selected' : ''}`}>
              <input type="checkbox" value={id} checked={interests.includes(id)} onChange={() => toggle(id)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sf-region">Region *</label>
        <select id="sf-region" required defaultValue="">
          <option value="" disabled>Select your state or region…</option>
          <optgroup label="United States">
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Outside the US">
            <option value="International">International</option>
          </optgroup>
        </select>
      </div>

      {status === 'error' && (
        <p className="form-error">Something went wrong. Please try again.</p>
      )}

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing up…' : 'Stay in Touch'}
      </button>
    </form>
  );
}
