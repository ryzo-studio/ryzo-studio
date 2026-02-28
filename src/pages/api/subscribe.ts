import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createClient } from '@sanity/client';

const sanity = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:   import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token:  import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const INTEREST_LABELS: Record<string, string> = {
  films:     'Films & Screenings',
  events:    'Events & Activations',
  educators: 'Educator Resources',
  studio:    'Studio News',
};

export const POST: APIRoute = async ({ request }) => {
  const { firstName, email, region, interests } = await request.json();

  // 1. Store in Sanity
  try {
    await sanity.create({
      _type: 'subscriber',
      firstName,
      email,
      region,
      interests,
      subscribedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Sanity write error:', err);
    // Don't block — still try to send notification
  }

  // 2. Notify hello@ryzo.studio via Resend
  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const interestList = (interests as string[])
    .map((i) => INTEREST_LABELS[i] ?? i)
    .join(', ') || 'None selected';

  try {
    await resend.emails.send({
      from: 'Ryzo Studios Website <onboarding@resend.dev>',
      to: 'hello@ryzo.studio',
      subject: `[ryzo.studio] New subscriber — ${firstName} (${region})`,
      html: `
        <p><strong>Name:</strong> ${firstName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Region:</strong> ${region}</p>
        <p><strong>Interests:</strong> ${interestList}</p>
      `,
    });
  } catch (err) {
    console.error('Resend notification error:', err);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
