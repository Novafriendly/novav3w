# 🤖 Google Gemini API Setup for Nova AI

## Why You Need This
The Nova AI chatbot is powered by Google Gemini, but you need your own **FREE** API key to use it!

## How to Get Your FREE API Key (Takes 2 minutes)

### Step 1: Get the API Key
1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the key (looks like: `AIzaSy...`)

### Step 2: Add It to Your Code
1. Open `chat.html` in a text editor
2. Press `Ctrl+F` and search for: `YOUR_API_KEY_HERE`
3. You'll find this around line 5000:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
   ```
4. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   const GEMINI_API_KEY = 'AIzaSyABC123...YourKeyHere';
   ```
5. Save the file

### Step 3: Test It
1. Refresh your Nova Chat page
2. @mention `@Nova AI` or go to `#ai-assistance`
3. Ask something like "tell me a joke" or "what's 5+5"
4. Check browser console (F12) for success messages!

## What You Get (FREE!)
- ✅ 60 requests per minute
- ✅ Unlimited requests per day
- ✅ No credit card needed
- ✅ Powered by Gemini Pro (Google's smartest AI)
- ✅ Can answer ANYTHING

## Troubleshooting

**Console shows "API key not valid"?**
- Make sure you copied the entire key
- No spaces before/after the key
- Key should be in single quotes: `'AIzaSy...'`

**Still using fallback responses?**
- Check if key is still `YOUR_API_KEY_HERE`
- Open console (F12) to see error messages
- Make sure you saved the file

**Rate limit errors?**
- You hit 60 requests/minute limit
- Wait 1 minute and try again
- Completely normal for free tier!

## Need Help?
- Open browser console (F12) to see detailed error messages
- Check that your key works at: https://makersuite.google.com
- Make sure you're signed in to Google

---

**Once setup, Nova AI will be SUPER SMART! 🧠✨**
