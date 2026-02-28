import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const { firstName, lastName, email, org, subject, message } = await request.json();

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const subjectLabels: Record<string, string> = {
    event: 'Event / Activation',
    partnership: 'Partnership',
    press: 'Press / Media',
    education: 'Educator Resources',
    general: 'General Inquiry',
    other: 'Other',
  };

  try {
    await resend.emails.send({
      from: 'Ryzo Studios Website <onboarding@resend.dev>',
      to: 'hello@ryzo.studio',
      replyTo: email,
      subject: `[ryzo.studio] ${subjectLabels[subject] ?? subject} — ${firstName} ${lastName}`,
      html: `
        <p><strong>From:</strong> ${firstName} ${lastName} &lt;${email}&gt;</p>
        ${org ? `<p><strong>Organization:</strong> ${org}</p>` : ''}
        <p><strong>Subject:</strong> ${subjectLabels[subject] ?? subject}</p>
        <hr />
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
  }
};
