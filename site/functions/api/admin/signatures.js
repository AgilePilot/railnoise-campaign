export async function onRequestGet(context) {
  const { request, env } = context;
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

  if (!checkAdmin(request, env)) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401,
      headers: { ...corsHeaders, 'WWW-Authenticate': 'Basic realm="Admin"' },
    });
  }

  const { results } = await env.DB.prepare(
    'SELECT id, name, email, postcode, phone, resident, whatsapp, confirmed, consent_timestamp, created_at FROM signatures ORDER BY created_at DESC'
  ).all();

  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) as total FROM signatures WHERE confirmed = 1'
  ).first();

  return Response.json({ total_confirmed: countRow.total, signatures: results }, { headers: corsHeaders });
}

function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Basic ')) return false;
  const decoded = atob(auth.slice(6));
  const [, password] = decoded.split(':');
  return password === env.ADMIN_PASSWORD;
}
