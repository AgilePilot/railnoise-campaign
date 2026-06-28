export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/count' && request.method === 'GET') {
        return await handleCount(env, corsHeaders);
      }
      if (path === '/api/sign' && request.method === 'POST') {
        return await handleSign(request, env, corsHeaders);
      }
      if (path === '/api/confirm' && request.method === 'GET') {
        return await handleConfirm(url, env);
      }
      if (path === '/api/delete' && request.method === 'GET') {
        return await handleDelete(url, env);
      }
      if (path === '/api/admin/signatures' && request.method === 'GET') {
        return await handleAdminList(request, env, corsHeaders);
      }
      if (path === '/api/admin/export' && request.method === 'GET') {
        return await handleAdminExport(request, env);
      }

      return json({ error: 'Not found' }, 404, corsHeaders);
    } catch (e) {
      return json({ error: 'Internal error' }, 500, corsHeaders);
    }
  },
};

async function handleCount(env, headers) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM signatures WHERE confirmed = 1'
  ).first();
  return json({ count: row.count }, 200, headers);
}

async function handleSign(request, env, headers) {
  const body = await request.json();
  const { name, email, postcode, phone, resident, whatsapp } = body;

  if (!name?.trim() || !email?.trim() || !postcode?.trim()) {
    return json({ error: 'Name, email, and postcode are required.' }, 400, headers);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address.' }, 400, headers);
  }

  const existing = await env.DB.prepare(
    'SELECT id, confirmed FROM signatures WHERE email = ?'
  ).bind(email.trim().toLowerCase()).first();

  if (existing) {
    if (existing.confirmed) {
      return json({ error: 'This email has already signed the petition.' }, 409, headers);
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

  await sendConfirmationEmail(env, email.trim(), name.trim(), confirmToken, deleteToken);

  return json({ success: true }, 201, headers);
}

async function handleConfirm(url, env) {
  const token = url.searchParams.get('token');
  if (!token) return redirectWithMessage(env, 'Invalid confirmation link.');

  const row = await env.DB.prepare(
    'SELECT id, confirmed FROM signatures WHERE confirm_token = ?'
  ).bind(token).first();

  if (!row) return redirectWithMessage(env, 'Signature not found. It may have been removed.');
  if (row.confirmed) return redirectWithMessage(env, 'Your signature was already confirmed. Thank you!');

  await env.DB.prepare(
    'UPDATE signatures SET confirmed = 1 WHERE id = ?'
  ).bind(row.id).run();

  return Response.redirect(`${env.SITE_URL || 'https://noisytrains.org'}/thank-you.html`, 302);
}

async function handleDelete(url, env) {
  const token = url.searchParams.get('token');
  if (!token) return redirectWithMessage(env, 'Invalid deletion link.');

  const row = await env.DB.prepare(
    'SELECT id FROM signatures WHERE delete_token = ?'
  ).bind(token).first();

  if (!row) return redirectWithMessage(env, 'Record not found. It may have already been deleted.');

  await env.DB.prepare('DELETE FROM signatures WHERE id = ?').bind(row.id).run();

  return htmlResponse(`
    <h1>Data Removed</h1>
    <p>Your signature and all associated data have been permanently deleted.</p>
    <p><a href="${env.SITE_URL || 'https://noisytrains.org'}">Return to noisytrains.org</a></p>
  `);
}

function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Basic ')) return false;
  const decoded = atob(auth.slice(6));
  const [, password] = decoded.split(':');
  return password === env.ADMIN_PASSWORD;
}

async function handleAdminList(request, env, headers) {
  if (!checkAdmin(request, env)) {
    return json({ error: 'Unauthorized' }, 401, { ...headers, 'WWW-Authenticate': 'Basic realm="Admin"' });
  }

  const { results } = await env.DB.prepare(
    'SELECT id, name, email, postcode, phone, resident, whatsapp, confirmed, consent_timestamp, created_at FROM signatures ORDER BY created_at DESC'
  ).all();

  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) as total FROM signatures WHERE confirmed = 1'
  ).first();

  return json({ total_confirmed: countRow.total, signatures: results }, 200, headers);
}

async function handleAdminExport(request, env) {
  if (!checkAdmin(request, env)) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
  }

  const { results } = await env.DB.prepare(
    'SELECT name, email, postcode, phone, resident, confirmed, consent_timestamp, created_at FROM signatures WHERE confirmed = 1 ORDER BY created_at ASC'
  ).all();

  const csvHeader = 'Name,Email,Postcode,Phone,Resident,Consent Timestamp,Signed At\n';
  const csvRows = results.map(r =>
    [r.name, r.email, r.postcode, r.phone || '', r.resident, r.consent_timestamp, r.created_at]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n');

  return new Response(csvHeader + csvRows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="signatures.csv"',
    },
  });
}

async function sendConfirmationEmail(env, email, name, confirmToken, deleteToken) {
  const siteUrl = env.SITE_URL || 'https://noisytrains.org';
  const confirmUrl = `${siteUrl}/api/confirm?token=${confirmToken}`;
  const deleteUrl = `${siteUrl}/api/delete?token=${deleteToken}`;

  // Uses Cloudflare Email Workers or MailChannels (free on CF Workers)
  const emailBody = `Hi ${name},

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
        personalizations: [{ to: [{ email, name }] }],
        from: { email: 'campaign@noisytrains.org', name: 'Chiswick W4 Rail Noise Campaign' },
        subject: 'Confirm your signature — Chiswick W4 Rail Noise Campaign',
        content: [{ type: 'text/plain', value: emailBody }],
      }),
    });
  } catch (e) {
    // Email send failure is non-fatal; signature is still recorded
  }
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function redirectWithMessage(env, message) {
  return htmlResponse(`<p>${message}</p><p><a href="${env.SITE_URL || 'https://noisytrains.org'}">Return to noisytrains.org</a></p>`);
}

function htmlResponse(body) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chiswick W4 Rail Noise Campaign</title><style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}a{color:#1a5632}</style></head><body>${body}</body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
