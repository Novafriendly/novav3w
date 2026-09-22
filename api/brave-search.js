const BRAVE_ORIGIN = 'https://search.brave.com/';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Use GET.');
  }

  const query = new URL(req.url, 'https://nova.local').searchParams.get('q')?.trim();
  if (!query || query.length > 200) return res.status(400).send('Enter a search query.');

  try {
    const target = new URL('/search', BRAVE_ORIGIN);
    target.search = new URLSearchParams({ q: query, source: 'web' }).toString();
    const response = await fetch(target, {
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      },
    });
    if (!response.ok) return res.status(502).send('Brave Search is temporarily unavailable.');

    let html = await response.text();
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${BRAVE_ORIGIN}">`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch {
    return res.status(504).send('Brave Search timed out.');
  }
}
