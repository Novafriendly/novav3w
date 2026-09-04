# 🚀 Deployment Guide - Nova on Vercel

## Prerequisites ✅

- A free [Vercel account](https://vercel.com/signup) (sign up with GitHub)
- Your Nova project folder ready

## Method 1: Deploy via Vercel Website (Easiest) 🖱️

### Step 1: Prepare Your Project

1. Make sure all files are in your `Nova` folder
2. You should have these new files:
   - `package.json`
   - `server.js`
   - `vercel.json`
   - `.gitignore`

### Step 2: Create GitHub Repository (Recommended)

1. Go to [github.com](https://github.com) and create a new repository
2. Name it "Nova" (or whatever you like)
3. **Don't initialize with README** (we already have files)

4. Push your Nova folder to GitHub:
```bash
cd C:\Users\willi\OneDrive\Documents\Nova
git init
git add .
git commit -m "Initial commit - Nova project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Nova.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your **Nova** repository
4. Vercel will auto-detect settings
5. Click **"Deploy"** 🚀

**That's it!** Your site will be live in ~2 minutes at:
```
https://nova-XXXXX.vercel.app
```

---

## Method 2: Deploy via Vercel CLI 💻

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd C:\Users\willi\OneDrive\Documents\Nova
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → nova (or your choice)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

**Done!** 🎉

---

## Method 3: Drag & Drop (No Git Required) 📦

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Browse"** under "Import Third-Party Git Repository"
3. Select your entire **Nova** folder
4. Click **"Deploy"**

---

## After Deployment ✨

### Your Nova is now live!

You'll get a URL like:
```
https://nova-abc123.vercel.app
```

### Features that work:
- ✅ All HTML pages (home, games, apps, settings)
- ✅ Proxy server at `/bare/` endpoint
- ✅ All games and apps
- ✅ All backgrounds and media
- ✅ Browser functionality with working proxy
- ✅ Everything is FREE!

### Custom Domain (Optional)

Want `nova.yourdomain.com` instead of `nova-abc123.vercel.app`?

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS instructions

**Free subdomain alternatives:**
- Use Vercel's free domain (no setup needed)
- Or use [is-a.dev](https://is-a.dev) for free `.is-a.dev` subdomain

---

## Troubleshooting 🔧

### Build fails?
- Make sure `package.json` exists in root
- Check Node.js version (needs 18+)

### Proxy not working?
- Check browser console for errors
- Verify `/bare/` endpoint is accessible
- May need to wait 1-2 minutes after deployment

### Assets not loading?
- Check file paths (case-sensitive!)
- Ensure `Img/` folder is uploaded
- Verify `covers-main/` and `assets-main/` folders exist

---

## Environment Variables (Optional) 🔐

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
PORT=3000
```

---

## Update Your Deployment 🔄

**If using Git:**
```bash
git add .
git commit -m "Update Nova"
git push
```
Vercel auto-deploys on push!

**If using CLI:**
```bash
vercel --prod
```

**If using drag & drop:**
Just drag & drop again!

---

## Need Help? 💬

- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Bare Server Docs](https://github.com/tomphttp/bare-server-node)
- Open an issue on GitHub

---

**🎉 Congratulations! Nova is now live and accessible from anywhere!**
