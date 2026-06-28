export async function onRequestGet(context) {
  const { request, env } = context;

  if (!checkAdmin(request, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    });
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

function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Basic ')) return false;
  const decoded = atob(auth.slice(6));
  const [, password] = decoded.split(':');
  return password === env.ADMIN_PASSWORD;
}
