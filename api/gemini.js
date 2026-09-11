// Secure Gemini API Backend
// This keeps your API key secret and adds image support

// In a production environment, you would:
// 1. Deploy this to a serverless function (Vercel, Netlify, Cloudflare Workers)
// 2. Set GEMINI_API_KEY as an environment variable
// 3. Never commit the API key to GitHub

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

// For local testing, you can use a .env file:
// Create a .env file in the root with: GEMINI_API_KEY=your_key_here
// Install dotenv: npm install dotenv
// Then uncomment the line below:
// require('dotenv').config();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, imageData, imageType } = req.body;
    
    if (!message && !imageData) {
      return res.status(400).json({ error: 'Message or image required' });
    }
    
    // Check if API key is configured
    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE' || !GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        fallback: true
      });
    }
    
    // Choose model based on whether image is present
    const model = imageData ? 'gemini-pro-vision' : 'gemini-pro';
    
    // Build request body
    const parts = [];
    
    if (message) {
      parts.push({ text: message });
    }
    
    if (imageData) {
      // Image should be base64 encoded
      parts.push({
        inline_data: {
          mime_type: imageType || 'image/jpeg',
          data: imageData
        }
      });
    }
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gemini API error',
        details: errorData,
        fallback: true
      });
    }
    
    const data = await response.json();
    
    // Extract response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ 
        success: true,
        response: text,
        hasImage: !!imageData
      });
    }
    
    return res.status(500).json({ 
      error: 'Unexpected response format',
      fallback: true
    });
    
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      fallback: true
    });
  }
}
