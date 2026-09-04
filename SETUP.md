# 🚀 Quick Setup Guide

## ✅ What I Just Created For You

I've set up your Nova project to work as a **single unified project** with both the website AND proxy server integrated!

### New Files Created:

1. **`package.json`** - Dependencies and scripts
2. **`server.js`** - Express server + Bare proxy server
3. **`vercel.json`** - Vercel deployment configuration
4. **`.gitignore`** - Git ignore rules
5. **`README.md`** - Project documentation
6. **`DEPLOY.md`** - Detailed deployment guide
7. **`start.bat`** - Quick start script for Windows

---

## 🏃‍♂️ Quick Start (Local Testing)

### Option 1: Double-click `start.bat` (Easiest)

Just double-click **`start.bat`** in your Nova folder!

It will:
1. Install dependencies automatically
2. Start the server
3. Open at `http://localhost:3000`

### Option 2: Manual Commands

Open Command Prompt in your Nova folder:

```bash
# Install dependencies (only needed once)
npm install

# Start the server
npm start
```

Visit: **http://localhost:3000**

---

## 🌐 Deploy to Vercel (Free Hosting)

### Quick Deploy:

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Sign up/login (use GitHub)
3. Click **"Import Project"**
4. Either:
   - Connect your GitHub repo, OR
   - Upload your Nova folder directly
5. Click **"Deploy"**

**You'll get a free URL like:** `https://nova-xyz.vercel.app`

### Detailed Instructions:

See **`DEPLOY.md`** for step-by-step guide with screenshots and troubleshooting!

---

## ✨ What's Changed?

### Before:
- ❌ Separate Scramjet folder
- ❌ Needed two deployments
- ❌ CORS issues

### Now:
- ✅ Everything in ONE project
- ✅ Deploy to ONE URL
- ✅ Proxy works automatically at `/bare/`
- ✅ No CORS issues
- ✅ Completely FREE hosting

---

## 📁 Project Structure

```
Nova/
├── 📄 home.html              # Main page
├── 📄 games.html             # Games library
├── 📄 apps.html              # Apps hub
├── 📄 browser.html           # Browser with proxy
├── 📄 settings.html          # Settings
├── 📄 game-player.html       # Game player
├── 📄 app-player.html        # App player
│
├── 🔧 server.js              # Express + Bare server (NEW!)
├── 📦 package.json           # Dependencies (NEW!)
├── ⚙️ vercel.json            # Vercel config (NEW!)
├── 🚀 start.bat              # Quick start (NEW!)
│
├── 📚 README.md              # Documentation (NEW!)
├── 📚 DEPLOY.md              # Deploy guide (NEW!)
├── 📚 SETUP.md               # This file (NEW!)
│
├── 📁 Img/                   # Images & wallpapers
├── 📁 covers-main/           # Game covers
└── 📁 assets-main/           # Game assets
```

---

## 🔧 How the Proxy Works Now

### Before:
```
Frontend (Nova) → http://scramjet-separate.vercel.app/scramjet/
```

### Now:
```
Frontend (Nova) → /bare/ (same domain!)
```

**No configuration needed!** It just works because the proxy server is running on the same domain.

---

## 🎯 Next Steps

### 1. Test Locally (Optional but Recommended)

```bash
# Run this in Nova folder
npm install
npm start
```

Visit `http://localhost:3000` and test:
- ✅ Home page loads
- ✅ Games work
- ✅ Browser proxy works
- ✅ Apps work

### 2. Deploy to Vercel

Follow **`DEPLOY.md`** guide!

Easiest method:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag & drop your Nova folder
3. Click Deploy
4. **DONE!** 🎉

---

## 💡 Pro Tips

### Free Domain Options:

1. **Vercel subdomain** (automatic)
   - `your-project.vercel.app`
   - No setup needed!

2. **is-a.dev** (free custom)
   - Get `yourname.is-a.dev`
   - [Apply here](https://is-a.dev)

3. **Freenom** (free domains)
   - Get `.tk`, `.ml`, `.ga` domains
   - [Get free domain](https://freenom.com)

### Keep it Updated:

After making changes:
```bash
git add .
git commit -m "Update"
git push
```
Vercel auto-deploys!

---

## ❓ FAQ

**Q: Do I need to pay for anything?**
A: Nope! Everything is 100% FREE.

**Q: Will the proxy work on Vercel?**
A: YES! The Bare server runs as part of your app.

**Q: Can I use a custom domain?**
A: Yes! Add it in Vercel settings.

**Q: What if something breaks?**
A: Check `DEPLOY.md` troubleshooting section!

**Q: How do I update after deploying?**
A: Just push to Git (if using GitHub) or redeploy (if drag & drop)

---

## 🆘 Need Help?

1. Read **`DEPLOY.md`** for detailed deployment steps
2. Check **`README.md`** for project overview
3. Test locally first with `npm start`
4. Check Vercel logs if deployment fails

---

## 🎉 You're All Set!

Your Nova project is now:
- ✅ Ready for local development
- ✅ Ready to deploy to Vercel
- ✅ Proxy server integrated
- ✅ Completely free to host

**Just run `start.bat` or deploy to Vercel!** 🚀
