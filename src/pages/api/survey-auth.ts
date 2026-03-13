import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const password = formData.get('password')?.toString() ?? '';
  const redirect = formData.get('redirect')?.toString() ?? '/rage-fighters/surveydata';

  const correct = process.env.SURVEY_PASSWORD;

  if (!correct) {
    return new Response('Server misconfigured: SURVEY_PASSWORD not set.', { status: 500 });
  }

  if (password === correct) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirect,
        'Set-Cookie': `survey_auth=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`,
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${redirect}?error=1`,
    },
  });
};
