// Vercel Serverless Function to proxy blocked CDN requests
// This fetches content from blocked CDNs server-side where there's no blocking

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Validate URL
    const url = new URL(targetUrl);
    
    // Only allow specific CDN domains for security
    const allowedDomains = [
      'cdn.jsdelivr.net',
      'cdn.statically.io',
      'raw.githubusercontent.com',
      'fastly.jsdelivr.net'
    ];

    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    console.log('📥 Proxying CDN request:', targetUrl);

    // Fetch the content from the CDN
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `CDN request failed: ${response.statusText}` 
      });
    }

    // Get content type from CDN response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the response
    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('❌ CDN Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Proxy failed', 
      details: error.message 
    });
  }
}
