export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const siteUrl = env.SITE_URL || 'https://noisytrains.org';

  if (!token) return htmlResponse('Invalid deletion link.', siteUrl);

  const row = await env.DB.prepare(
    'SELECT id FROM signatures WHERE delete_token = ?'
  ).bind(token).first();

  if (!row) return htmlResponse('Record not found. It may have already been deleted.', siteUrl);

  await env.DB.prepare('DELETE FROM signatures WHERE id = ?').bind(row.id).run();

  return htmlResponse('Your signature and all associated data have been permanently deleted.', siteUrl);
}

function htmlResponse(message, siteUrl) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chiswick W4 Rail Noise Campaign</title><style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}a{color:#1a5632}</style></head><body><p>${message}</p><p><a href="${siteUrl}">Return to noisytrains.org</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
