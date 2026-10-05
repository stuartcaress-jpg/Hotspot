export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // This is a browser-restricted Google Maps key, separate from the
  // server-side Places/Geocoding key used by /api/groups.
  const key = process.env.GOOGLE_MAPS_BROWSER_KEY || '';

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ key });
}
