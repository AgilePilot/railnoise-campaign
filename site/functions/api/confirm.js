export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const siteUrl = env.SITE_URL || 'https://noisytrains.org';

  if (!token) return htmlResponse('Invalid confirmation link.', siteUrl);

  const row = await env.DB.prepare(
    'SELECT id, confirmed FROM signatures WHERE confirm_token = ?'
  ).bind(token).first();

  if (!row) return htmlResponse('Signature not found. It may have been removed.', siteUrl);
  if (row.confirmed) return htmlResponse('Your signature was already confirmed. Thank you!', siteUrl);

  await env.DB.prepare('UPDATE signatures SET confirmed = 1 WHERE id = ?').bind(row.id).run();

  return Response.redirect(`${siteUrl}/thank-you.html`, 302);
}

function htmlResponse(message, siteUrl) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chiswick W4 Rail Noise Campaign</title><style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}a{color:#1a5632}</style></head><body><p>${message}</p><p><a href="${siteUrl}">Return to noisytrains.org</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
