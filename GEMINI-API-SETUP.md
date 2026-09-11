# 🤖 Google Gemini API Setup for Nova AI

## 🔒 SECURITY UPGRADE: Keep Your API Key Safe!

Nova AI now supports **two modes**:
1. **🔓 Quick Setup** (Testing only - API key visible in browser)
2. **🔒 Secure Setup** (Recommended - API key hidden on server)

---

## 🚀 Quick Setup (For Testing)

### Step 1: Get Your FREE API Key
1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (looks like: `AIzaSy...`)

### Step 2: Add to chat.html (Line ~5030)
```javascript
const GEMINI_API_KEY = 'AIzaSy...'; // Replace with your key
```

**⚠️ WARNING:** This method exposes your API key in the browser source code! Anyone can see it and use it. Only use for testing!

---

## 🔒 Secure Setup (Recommended for Production)

This keeps your API key completely hidden from users!

### Option A: Deploy to Vercel (Easiest)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json` in your project root:**
   ```json
   {
     "functions": {
       "api/gemini.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     },
     "env": {
       "GEMINI_API_KEY": "@gemini-api-key"
     }
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add your API key as environment variable:**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   Paste your Gemini API key when prompted.

5. **Get your deployment URL** (e.g., `https://your-app.vercel.app`)

6. **Update chat.html (Line ~5010):**
   ```javascript
   const USE_SECURE_BACKEND = true;
   const BACKEND_URL = 'https://your-app.vercel.app/api/gemini';
   ```

### Option B: Deploy to Netlify

1. **Create `netlify.toml`:**
   ```toml
   [build]
     functions = "api"
   
   [functions]
     directory = "api"
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repo to Netlify
   - Add environment variable: `GEMINI_API_KEY` = your API key
   - Deploy!

3. **Update chat.html with your Netlify URL**

### Option C: Cloudflare Workers

1. **Create a Cloudflare Worker with the code from `api/gemini.js`**
2. **Add your API key as a secret**
3. **Update chat.html with your Worker URL**

---

## 🖼️ NEW: Image Support!

Nova AI can now **see and analyze images**!

### How to Use:
1. Upload an image in chat (using the 📷 button)
2. Tag `@Nova AI` with your question
3. AI will analyze the image and respond!

### Examples:
- "What's in this image?"
- "Describe what you see"
- "What color is this?"
- "Read the text in this image"

### Technical Details:
- Uses **Gemini Pro Vision** model for images
- Automatically detects images from the last message
- Supports: JPG, PNG, GIF, WebP
- Max image size: 4MB (Gemini limit)

---

## 🎯 What You Get (FREE!)

- ✅ 60 requests per minute
- ✅ Unlimited requests per day  
- ✅ No credit card needed
- ✅ Text + Image analysis
- ✅ Powered by Gemini Pro & Gemini Pro Vision
- ✅ Can answer ANYTHING

---

## 🔧 Troubleshooting

**"API key not valid" error?**
- Copy the entire key (no spaces)
- Key should be in quotes: `'AIzaSy...'`
- Make sure you saved the file

**Image not working?**
- Make sure you uploaded an image first
- Tag @Nova AI in the same channel
- Check console (F12) for "🖼️ Image attached" message

**Secure backend not working?**
- Verify `USE_SECURE_BACKEND = true`
- Check `BACKEND_URL` is correct
- Test backend URL directly in browser
- Check environment variable is set

**Rate limit errors?**
- You hit 60 requests/minute
- Wait 1 minute and try again
- Completely normal for free tier

---

## 📊 API Key Security Comparison

| Method | Security | Setup | Best For |
|--------|----------|-------|----------|
| Quick Setup | 🔓 Low | 2 min | Testing |
| Vercel | 🔒 High | 10 min | Production |
| Netlify | 🔒 High | 10 min | Production |
| Cloudflare | 🔒 High | 15 min | Production |

---

## 💡 Pro Tips

1. **Never commit your API key to GitHub!**
   - Add to `.gitignore` if using quick setup
   - Always use environment variables for production

2. **Monitor your usage:**
   - Check Google AI Studio for API usage
   - Free tier = 60 requests/minute

3. **Test locally first:**
   - Use quick setup to test features
   - Switch to secure backend before sharing

4. **Image tips:**
   - Smaller images = faster responses
   - Clear, well-lit images work best
   - AI can read text in images!

---

**Once setup, Nova AI will be SUPER SMART with vision! 🧠👁️✨**
