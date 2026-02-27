export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { client_id, client_secret, ...rest } = req.body;

  if (!client_id || !client_secret) {
    return res.status(400).json({ error: 'Missing client_id or client_secret' });
  }

  const body = new URLSearchParams({ client_id, ...rest });

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(client_id + ':' + client_secret).toString('base64')}`,
    },
    body,
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
