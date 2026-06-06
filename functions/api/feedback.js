/**
 * Cloudflare Pages Function
 * Route: /api/feedback  (POST)
 *
 * Environment Variables to set in Cloudflare Dashboard:
 *   BOT_TOKEN   — your Telegram bot token
 *   OWNER_ID    — your Telegram user/chat ID to receive feedback
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const BOT_TOKEN = env.BOT_TOKEN;
  const OWNER_ID  = env.OWNER_ID;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!BOT_TOKEN || !OWNER_ID) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Server not configured.' }),
      { status: 500, headers }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'Invalid request body.' }),
      { status: 400, headers }
    );
  }

  const { tgId, feedback } = body;

  if (!tgId || !feedback) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Missing fields.' }),
      { status: 400, headers }
    );
  }

  // Build Telegram message
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text =
    `🎮 *New Feedback Received*\n\n` +
    `👤 *User ID:* \`${tgId}\`\n` +
    `📅 *Time:* ${now} IST\n\n` +
    `💬 *Feedback:*\n${feedback}\n\n` +
    `━━━━━━━━━━━━━━\n` +
    `_via Mafia Game Bot Feedback Site_`;

  const tgRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: OWNER_ID,
        text,
        parse_mode: 'Markdown',
      }),
    }
  );

  const tgData = await tgRes.json();

  if (!tgData.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to send message. Check bot config.' }),
      { status: 500, headers }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers }
  );
}

// Handle OPTIONS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
      }
      
