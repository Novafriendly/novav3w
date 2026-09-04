# ⚡ Quick GitHub Upload - 5 Minutes

## 🎯 Super Fast Method

### Step 1: Create GitHub Repo (2 minutes)
1. Go to [github.com/new](https://github.com/new)
2. Name it: **Nova**
3. **DON'T** check any boxes
4. Click **"Create repository"**
5. Copy the URL (like `https://github.com/yourusername/Nova.git`)

### Step 2: Upload Files (3 minutes)
Open Command Prompt in Nova folder:

```bash
cd C:\Users\willi\OneDrive\Documents\Nova

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Nova.git
git push -u origin main
```

**Replace `YOUR-USERNAME` with your GitHub username!**

### Step 3: Deploy to Vercel (1 minute)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **Nova**
4. Click **"Deploy"**

## 🎉 Done!

Your site is live at: `https://your-project.vercel.app`

---

## 🔐 If It Asks for Login:
- Username: Your GitHub username
- Password: Create a [Personal Access Token](https://github.com/settings/tokens)

---

**Need detailed instructions? See `GITHUB-GUIDE.md`**
