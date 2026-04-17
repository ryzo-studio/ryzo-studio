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
  'breathe_mastery', 'pause_mastery', 'chill_mastery', 'connect_mastery',
];

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const secret = process.env.COLLECT_SECRET;
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
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = rawKey.replace(/\\n/g, '\n');
    console.log('collect.ts: email present:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, 'key length:', privateKey.length, 'sheetId present:', !!process.env.GOOGLE_SHEET_ID);

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check if headers row exists
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:Z1',
    });
    const firstRow = existing.data.values?.[0];
    const headersMatch = firstRow && SHEET_HEADERS.every((h, i) => firstRow[i] === h);
    if (!headersMatch) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
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
  } catch (err: any) {
    console.error('collect error:', err);
    return new Response(JSON.stringify({ error: 'Server error', detail: String(err?.message || err) }), { status: 500 });
  }
};
