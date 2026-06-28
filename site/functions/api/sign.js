export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

  const body = await request.json();
  const { name, email, postcode, phone, resident, whatsapp } = body;

  if (!name?.trim() || !email?.trim() || !postcode?.trim()) {
    return Response.json({ error: 'Name, email, and postcode are required.' }, { status: 400, headers: corsHeaders });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address.' }, { status: 400, headers: corsHeaders });
  }

  const existing = await env.DB.prepare(
    'SELECT id, confirmed FROM signatures WHERE email = ?'
  ).bind(email.trim().toLowerCase()).first();

  if (existing) {
    if (existing.confirmed) {
      return Response.json({ error: 'This email has already signed the petition.' }, { status: 409, headers: corsHeaders });
    }
    await env.DB.prepare('DELETE FROM signatures WHERE id = ?').bind(existing.id).run();
  }

  const confirmToken = crypto.randomUUID();
  const deleteToken = crypto.randomUUID();
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

  await env.DB.prepare(
    `INSERT INTO signatures (name, email, postcode, phone, resident, whatsapp, consent_timestamp, consent_ip, confirm_token, delete_token)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)`
  ).bind(
    name.trim(),
    email.trim().toLowerCase(),
    postcode.trim().toUpperCase(),
    phone?.trim() || null,
    resident || 'yes',
    whatsapp ? 1 : 0,
    ip,
    confirmToken,
    deleteToken
  ).run();

  const siteUrl = env.SITE_URL || 'https://noisytrains.org';
  const confirmUrl = `${siteUrl}/api/confirm?token=${confirmToken}`;
  const deleteUrl = `${siteUrl}/api/delete?token=${deleteToken}`;

  const emailBody = `Hi ${name.trim()},

Thank you for signing the Chiswick W4 Rail Noise Campaign petition!

Please confirm your signature by clicking this link:
${confirmUrl}

If you did not sign this petition, you can ignore this email.

To remove your data at any time, click here:
${deleteUrl}

— The Chiswick W4 Rail Noise Campaign
https://noisytrains.org`;

  try {
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email.trim(), name: name.trim() }] }],
        from: { email: 'campaign@noisytrains.org', name: 'Chiswick W4 Rail Noise Campaign' },
        subject: 'Confirm your signature — Chiswick W4 Rail Noise Campaign',
        content: [{ type: 'text/plain', value: emailBody }],
      }),
    });
  } catch (e) {
    // non-fatal
  }

  return Response.json({ success: true }, { status: 201, headers: corsHeaders });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
