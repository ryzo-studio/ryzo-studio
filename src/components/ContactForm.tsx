import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const f = e.currentTarget;
    const get = (id: string) => (f.querySelector(`#cf-${id}`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value ?? '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: get('first-name'),
          lastName:  get('last-name'),
          email:     get('email'),
          org:       get('org'),
          subject:   get('subject'),
          message:   get('message'),
        }),
      });

      if (res.ok) {
        setStatus('success');
        f.reset();
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
        <p className="form-success-headline">Message sent.</p>
        <p className="form-success-body">We'll get back to you within 3–5 business days.</p>
        <button className="btn btn-outline" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-first-name">First Name *</label>
          <input type="text" id="cf-first-name" required placeholder="First" />
        </div>
        <div className="form-group">
          <label htmlFor="cf-last-name">Last Name *</label>
          <input type="text" id="cf-last-name" required placeholder="Last" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cf-email">Email *</label>
        <input type="email" id="cf-email" required placeholder="you@example.com" />
      </div>

      <div className="form-group">
        <label htmlFor="cf-org">Organization</label>
        <input type="text" id="cf-org" placeholder="School, company, or personal" />
      </div>

      <div className="form-group">
        <label htmlFor="cf-subject">Subject *</label>
        <select id="cf-subject" required defaultValue="">
          <option value="" disabled>Select a topic...</option>
          <option value="event">Event / Activation</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press / Media</option>
          <option value="education">Educator Resources</option>
          <option value="general">General Inquiry</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="cf-message">Message *</label>
        <textarea id="cf-message" rows={5} required placeholder="What's on your mind?" />
      </div>

      {status === 'error' && (
        <p className="form-error">Something went wrong. Please try again or email us directly at hello@ryzo.studio.</p>
      )}

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
      <p className="form-note">We respond to all messages within 3–5 business days.</p>
    </form>
  );
}
