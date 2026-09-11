# 🤖 Nova AI - Quick Start Guide

## 🎯 What's New?

Nova AI just got **MAJOR UPGRADES**:

1. **🔒 Secure API Keys** - Your API key stays hidden from users
2. **🖼️ Image Analysis** - AI can see and describe images!
3. **⚡ Better Responses** - Smarter, longer, more accurate
4. **🚀 Easy Deployment** - Deploy to Vercel in 5 minutes

---

## 🏃 Quick Start (2 Options)

### Option 1: Quick Testing (2 minutes) 🔓

**⚠️ WARNING: API key will be visible in browser source!**

1. Get API key: https://makersuite.google.com/app/apikey
2. Open `chat.html`, find line ~5030
3. Replace `YOUR_API_KEY_HERE` with your key
4. Save and test!

**Use this for:** Testing features, learning how it works

**Don't use this for:** Production, sharing with others

---

### Option 2: Secure Production (10 minutes) 🔒

**✅ RECOMMENDED: API key hidden on server**

1. Get API key: https://makersuite.google.com/app/apikey
2. Install Vercel: `npm install -g vercel`
3. Deploy: `vercel`
4. Add API key: `vercel env add GEMINI_API_KEY`
5. Redeploy: `vercel --prod`
6. Update `chat.html` line ~5010:
   ```javascript
   const USE_SECURE_BACKEND = true;
   const BACKEND_URL = 'https://your-app.vercel.app/api/gemini';
   ```

**Use this for:** Production, sharing with users, real deployments

---

## 🖼️ How to Use Image Analysis

1. **Upload an image** in chat (click 📷 button)
2. **Tag @Nova AI** in your message
3. **Ask a question** like:
   - "What's in this image?"
   - "Describe what you see"
   - "What color is the car?"
   - "Read the text in this screenshot"

The AI will automatically detect the image and analyze it!

---

## 📚 Full Documentation

- **GEMINI-API-SETUP.md** - Complete API setup guide
- **DEPLOY-GUIDE.md** - Step-by-step deployment instructions
- **package.json** - NPM configuration
- **vercel.json** - Vercel deployment config
- **api/gemini.js** - Secure backend code

---

## 🔧 Files Changed

### New Files:
- `api/gemini.js` - Secure backend API
- `package.json` - NPM/deployment config
- `vercel.json` - Vercel configuration
- `.gitignore` - Protects API keys
- `DEPLOY-GUIDE.md` - Deployment instructions
- `GEMINI-API-SETUP.md` - API setup guide

### Modified Files:
- `chat.html` - Added image support + secure backend option

---

## 🎨 Features

### Text Chat
- Ask anything: coding, math, facts, jokes, advice
- Conversational and smart responses
- 700 character responses (vs 600 before)
- Fallback responses if API fails

### Image Analysis
- Upload images and ask questions
- AI describes what it sees
- Can read text in images
- Supports JPG, PNG, GIF, WebP
- Max size: 4MB

### Security
- API keys stored as environment variables
- Never exposed in browser code
- CORS configured properly
- `.gitignore` protects secrets

---

## 🐛 Troubleshooting

**"API key not valid"?**
- Check you copied the entire key
- No spaces before/after
- Key in quotes: `'AIzaSy...'`

**Image not working?**
- Upload image first
- Tag @Nova AI in same channel
- Check console (F12) for errors

**Backend not working?**
- Verify `USE_SECURE_BACKEND = true`
- Check `BACKEND_URL` is correct
- Test URL in browser directly

**Still stuck?**
- Open browser console (F12)
- Look for red error messages
- Check the full guides in docs folder

---

## 💡 Pro Tips

1. **Test locally first** - Use quick setup to test features
2. **Deploy securely** - Use Vercel/Netlify for production
3. **Never commit keys** - Always use environment variables
4. **Monitor usage** - Check Google AI Studio for limits
5. **Smaller images** - Faster responses, better accuracy

---

## 📊 Comparison

| Feature | Before | After |
|---------|--------|-------|
| Text only | ✅ | ✅ |
| Image analysis | ❌ | ✅ |
| API key security | ❌ | ✅ |
| Response length | 600 chars | 700 chars |
| Backend option | ❌ | ✅ |
| Deployment guide | ❌ | ✅ |

---

## 🎉 What You Get (FREE!)

- ✅ Unlimited text chat
- ✅ Image analysis (Gemini Pro Vision)
- ✅ 60 requests/minute
- ✅ No credit card needed
- ✅ Secure deployment option
- ✅ Complete documentation

---

## 🚀 Ready to Deploy?

**Quick Testing:**
```bash
# Just add your API key to chat.html line ~5030
```

**Secure Production:**
```bash
npm install -g vercel
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

**Read the guides:**
- Start with: `GEMINI-API-SETUP.md`
- For deployment: `DEPLOY-GUIDE.md`

---

**Your AI is now SUPER SMART with VISION! 🧠👁️✨**

Questions? Check console (F12) for detailed errors!
