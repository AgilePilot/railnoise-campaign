export async function onRequestGet(context) {
  const row = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM signatures WHERE confirmed = 1'
  ).first();
  return Response.json({ count: row.count }, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
