import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const AUDIENCE_ID = '8398772b-03c2-40cd-861a-76d76b155c23';

const INTEREST_LABELS: Record<string, string> = {
  films:     'Films & Screenings',
  events:    'Events & Activations',
  educators: 'Educator Resources',
  studio:    'Studio News',
};

export const POST: APIRoute = async ({ request }) => {
  let body: { firstName: string; lastName?: string; email: string; region: string; interests: string[] };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { firstName, lastName, email, region, interests } = body;

  // 1. Save to Resend Audience
  try {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email,
      firstName,
      lastName: lastName ?? '',
      unsubscribed: false,
    });
  } catch (err) {
    console.error('Resend audience error:', err);
  }

  // 2. Notify hello@ryzo.studio via Resend
  const interestList = (interests as string[])
    .map((i) => INTEREST_LABELS[i] ?? i)
    .join(', ');

  try {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // Notify the studio

    await resend.emails.send({
      from: 'Ryzo Studios <hello@ryzo.studio>',
      to: 'hello@ryzo.studio',
      subject: `New subscriber — ${firstName} ${lastName ?? ''} (${region})`,
      html: `
        <p><strong>Name:</strong> ${firstName} ${lastName ?? ''}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Region:</strong> ${region}</p>
        ${interestList ? `<p><strong>Interests:</strong> ${interestList}</p>` : ''}
      `,
    });

    // Welcome email to the subscriber
    await resend.emails.send({
      from: 'Ryzo Studios <hello@ryzo.studio>',
      to: email,
      subject: `You're in — welcome to the Ryzo Studios community`,
      html: `
        <p>Hey ${firstName},</p>
        <p>You're on the list. We'll reach out with updates that matter to you${interestList ? ` — ${interestList}` : ''}.</p>
        <p>In the meantime, explore what we're building:</p>
        <ul>
          <li><a href="https://www.ryzo.studio/release-the-beast">Release the Beast</a> — our animated short film</li>
          <li><a href="https://www.ryzo.studio/rage-fighters">Rage Fighters</a> — the Roblox game</li>
          <li><a href="https://www.ryzo.studio/events">Upcoming Events</a></li>
        </ul>
        <p>Follow us on <a href="https://www.youtube.com/@Ryzo-Studio">YouTube</a> for behind-the-scenes and releases.</p>
        <p>Roblox player? <a href="https://www.roblox.com/share/g/69304950">Join our community</a>.</p>
        <p>— The Ryzo Studios team</p>
      `,
    });
  } catch (err) {
    console.error('Resend notification error:', err);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
