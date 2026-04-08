import type { APIRoute } from 'astro';
import { google } from 'googleapis';

export const prerender = false;

const SHEET_HEADERS = [
  'timestamp', 'age', 'describe', 'roblox_freq', 'watched_film', 'played_game',
  'familiar_film', 'familiar_film_desc', 'familiar_game', 'familiar_game_desc',
  'recognize_stressors', 'what_connected', 'learn_skills', 'what_learned',
  'use_skills', 'situations', 'recommend_film', 'recommend_film_why',
  'recommend_game', 'recommend_game_why', 'anything_else',
  'battle_score', 'stans_captured', 'lore_correct', 'lore_total',
];

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const secret = import.meta.env.COLLECT_SECRET;
  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  try {
    const auth = new google.auth.JWT({
      email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (import.meta.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = import.meta.env.GOOGLE_SHEET_ID;

    // Check if headers row exists
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:Z1',
    });
    const firstRow = existing.data.values?.[0];
    if (!firstRow || firstRow.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1',
        valueInputOption: 'RAW',
        requestBody: { values: [SHEET_HEADERS] },
      });
    }

    // Append data row
    const row = SHEET_HEADERS.map(h => (body[h] !== undefined ? String(body[h]) : ''));
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('collect error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
