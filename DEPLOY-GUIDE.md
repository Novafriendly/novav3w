# 🚀 Secure Deployment Guide for Nova AI

This guide shows you how to deploy Nova's AI backend securely so your API key stays hidden!

---

## 📋 Prerequisites

1. Google Gemini API key (get from https://makersuite.google.com/app/apikey)
2. GitHub account (for deploying)
3. 10 minutes of your time

---

## 🎯 Method 1: Vercel (Easiest & Recommended)

Vercel is the easiest way to deploy. It's **completely FREE** and takes 5 minutes!

### Step 1: Install Vercel CLI

Open terminal/PowerShell and run:

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser. Sign in with GitHub, GitLab, or email.

### Step 3: Deploy

In your Nova project folder:

```bash
cd "C:\Users\willi\OneDrive\Documents\Nova"
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your username
- **Link to existing project?** → No
- **Project name?** → `nova-chat` (or whatever you want)
- **Directory?** → `.` (current directory)
- **Override settings?** → No

### Step 4: Add Your API Key

After deployment, add your Gemini API key as a secret:

```bash
vercel env add GEMINI_API_KEY
```

When prompted:
- **Value:** Paste your Gemini API key (e.g., `AIzaSy...`)
- **Environment:** Production
- **Add to other environments?** → Yes (add to all)

### Step 5: Redeploy with the Secret

```bash
vercel --prod
```

### Step 6: Get Your URL

After deployment, you'll see:
```
✅ Production: https://nova-chat-abc123.vercel.app
```

Copy this URL!

### Step 7: Update chat.html

Open `chat.html` and find line ~5010:

```javascript
const USE_SECURE_BACKEND = true;
const BACKEND_URL = 'https://nova-chat-abc123.vercel.app/api/gemini';
```

**Important:** Add `/api/gemini` at the end of your Vercel URL!

### Step 8: Test It!

1. Save and push to GitHub
2. Open your Nova chat
3. Upload an image
4. Tag @Nova AI and ask "What's in this image?"
5. Check console (F12) for success!

---

## 🎯 Method 2: Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Deploy

```bash
netlify deploy
```

Follow prompts and select your site.

### Step 4: Add Environment Variable

Go to Netlify Dashboard → Site Settings → Environment Variables

Add:
- **Key:** `GEMINI_API_KEY`
- **Value:** Your Gemini API key

### Step 5: Deploy to Production

```bash
netlify deploy --prod
```

### Step 6: Update chat.html

Use your Netlify URL:
```javascript
const BACKEND_URL = 'https://your-site.netlify.app/.netlify/functions/gemini';
```

---

## 🎯 Method 3: Cloudflare Workers (Advanced)

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login

```bash
wrangler login
```

### Step 3: Create Worker

```bash
wrangler init nova-ai-backend
```

### Step 4: Copy Code

Copy the content of `api/gemini.js` to `src/index.js` in your worker project.

### Step 5: Add Secret

```bash
wrangler secret put GEMINI_API_KEY
```

Paste your API key when prompted.

### Step 6: Deploy

```bash
wrangler publish
```

### Step 7: Update chat.html

```javascript
const BACKEND_URL = 'https://nova-ai-backend.your-subdomain.workers.dev';
```

---

## 🧪 Testing Your Deployment

### Test 1: Direct API Call

Open browser console and run:

```javascript
fetch('YOUR_BACKEND_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
})
.then(r => r.json())
.then(d => console.log('✅ Backend works!', d))
.catch(e => console.error('❌ Error:', e));
```

### Test 2: With Image

1. Upload an image in Nova chat
2. Tag @Nova AI with "What's in this image?"
3. Check console for:
   - `🖼️ Image attached to AI request`
   - `🖼️ AI analyzed image!`
   - `✅ Gemini API Response:`

### Test 3: Text Only

Just ask @Nova AI a question without an image.

---

## 🔒 Security Checklist

✅ API key stored as environment variable (not in code)  
✅ `.gitignore` includes `.env` files  
✅ `USE_SECURE_BACKEND = true` in chat.html  
✅ CORS headers configured  
✅ Backend URL uses HTTPS  
✅ No API keys committed to GitHub  

---

## 🐛 Troubleshooting

### "Failed to fetch" error

**Problem:** CORS not configured properly

**Solution:**
- Check vercel.json has CORS headers
- Redeploy after making changes
- Test backend URL directly in browser

### "API key not valid" on backend

**Problem:** Environment variable not set

**Solution:**
```bash
# For Vercel
vercel env add GEMINI_API_KEY

# For Netlify
# Add via dashboard

# For Cloudflare
wrangler secret put GEMINI_API_KEY
```

Then redeploy!

### Image not being analyzed

**Problem:** Image not converting to base64 properly

**Solution:**
- Check browser console for "🖼️ Image attached" message
- Make sure image uploaded successfully first
- Try a smaller image (< 4MB)
- Check image format is supported (JPG, PNG, GIF, WebP)

### Rate limit errors

**Problem:** Hitting 60 requests/minute limit

**Solution:**
- This is normal for free tier
- Wait 1 minute before trying again
- Consider caching responses for common questions

---

## 📊 Deployment Comparison

| Platform | Difficulty | Free Tier | Speed | Best For |
|----------|------------|-----------|-------|----------|
| **Vercel** | ⭐ Easy | 100GB bandwidth | Fast | Most users |
| **Netlify** | ⭐⭐ Medium | 100GB bandwidth | Fast | Netlify fans |
| **Cloudflare** | ⭐⭐⭐ Hard | 100k requests/day | Fastest | Advanced users |

---

## 🎉 You're Done!

Your Nova AI is now:
- ✅ Secure (API key hidden)
- ✅ Smart (Gemini Pro)
- ✅ Visual (Can see images)
- ✅ Fast (Edge network)
- ✅ Free (No costs)

**Enjoy your super-powered AI! 🚀🧠👁️**

---

## 💡 Pro Tips

1. **Monitor usage:** Check your Vercel/Netlify dashboard for request counts
2. **Add caching:** Reduce API calls by caching common responses
3. **Custom domain:** Add your own domain in Vercel/Netlify settings
4. **Webhooks:** Set up notifications for deployment status
5. **Analytics:** Add analytics to track AI usage

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Questions? Check the console (F12) for detailed error messages!**
