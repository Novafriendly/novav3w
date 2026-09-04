# 🚀 How to Upload Nova to GitHub - Complete Guide

## 📋 Prerequisites

1. ✅ GitHub account (free) - [Sign up here](https://github.com/signup)
2. ✅ Git installed on your computer
3. ✅ Your Nova folder ready

---

## 🔧 Step 1: Install Git (If Not Installed)

### Check if Git is installed:
Open Command Prompt and type:
```bash
git --version
```

### If you see a version number (like `git version 2.x.x`):
✅ You're good! Skip to Step 2.

### If you get an error:
1. Download Git: [git-scm.com/download/win](https://git-scm.com/download/win)
2. Install it (use all default settings)
3. Restart Command Prompt
4. Try `git --version` again

---

## 🌐 Step 2: Create GitHub Repository

### Option A: Using GitHub Website (Easier)

1. **Go to GitHub:**
   - Visit [github.com](https://github.com)
   - Log in to your account

2. **Create New Repository:**
   - Click the **"+"** icon (top right)
   - Click **"New repository"**

3. **Fill in Details:**
   ```
   Repository name:  Nova
   Description:      Gaming and productivity hub with built-in proxy
   Public or Private: Your choice!
   
   ❌ DON'T check these:
      ☐ Add a README file
      ☐ Add .gitignore
      ☐ Choose a license
   
   (We already have these files!)
   ```

4. **Click "Create repository"**

5. **Copy the URL:**
   You'll see a URL like:
   ```
   https://github.com/YOUR-USERNAME/Nova.git
   ```
   Copy this! You'll need it soon.

---

## 💻 Step 3: Upload Nova to GitHub

### Open Command Prompt in Nova folder:

**Method 1 (Easy):**
1. Open File Explorer
2. Navigate to: `C:\Users\willi\OneDrive\Documents\Nova`
3. Type `cmd` in the address bar
4. Press Enter

**Method 2 (Manual):**
```bash
cd C:\Users\willi\OneDrive\Documents\Nova
```

---

### Now run these commands one by one:

#### 1. Initialize Git
```bash
git init
```
✅ You should see: `Initialized empty Git repository`

#### 2. Add all files
```bash
git add .
```
✅ This adds all your Nova files to Git

#### 3. Create first commit
```bash
git commit -m "Initial commit - Nova project with integrated proxy"
```
✅ You should see a list of files being committed

#### 4. Set main branch
```bash
git branch -M main
```
✅ Sets the main branch name

#### 5. Add GitHub remote
```bash
git remote add origin https://github.com/YOUR-USERNAME/Nova.git
```
⚠️ **IMPORTANT:** Replace `YOUR-USERNAME` with your actual GitHub username!

#### 6. Push to GitHub
```bash
git push -u origin main
```

**If this is your first time, Git will ask for login:**
- Enter your GitHub username
- Enter your password (or personal access token)

✅ Files are uploading to GitHub!

---

## 🎉 Step 4: Verify Upload

1. Go to: `https://github.com/YOUR-USERNAME/Nova`
2. You should see all your files!

---

## 🔐 Authentication (If Needed)

### If Git asks for credentials:

**Modern Way (Personal Access Token):**

1. **Create Token:**
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Name it: `Nova Upload`
   - Check: ✅ `repo` (all repo permissions)
   - Click **"Generate token"**
   - **COPY THE TOKEN!** (You won't see it again!)

2. **Use Token:**
   - Username: Your GitHub username
   - Password: Paste the token (not your password!)

---

## 🔄 Step 5: Connect to Vercel

### Now that it's on GitHub:

1. **Go to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click **"Import Git Repository"**

2. **Select Repository:**
   - Find **"Nova"** in the list
   - Click **"Import"**

3. **Configure (if needed):**
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: (leave default)
   - Output Directory: (leave default)

4. **Click "Deploy"**

5. **Wait 2 minutes... DONE!** 🎉

Your site is live at: `https://nova-xyz.vercel.app`

---

## 📝 Common Commands Reference

### After initial upload, when you make changes:

```bash
# 1. Check what changed
git status

# 2. Add changed files
git add .

# 3. Commit changes
git commit -m "Description of what you changed"

# 4. Push to GitHub
git push
```

**Vercel will auto-deploy when you push to GitHub!** 🚀

---

## 🛠️ Troubleshooting

### Problem: "git is not recognized"
**Solution:** Install Git from [git-scm.com](https://git-scm.com)

### Problem: "Permission denied"
**Solution:** Use Personal Access Token instead of password

### Problem: "Remote origin already exists"
**Solution:** 
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/Nova.git
```

### Problem: Files not uploading
**Solution:** Check `.gitignore` - make sure it's not blocking your files

### Problem: Large files failing
**Solution:** GitHub has 100MB file limit. Check for large video files.

---

## 📊 Complete Command Summary

**Copy-paste these (replace YOUR-USERNAME):**

```bash
cd C:\Users\willi\OneDrive\Documents\Nova
git init
git add .
git commit -m "Initial commit - Nova project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Nova.git
git push -u origin main
```

---

## ✅ What Gets Uploaded

All these files go to GitHub:
- ✅ All HTML files (index, home, games, apps, etc.)
- ✅ server.js, package.json, vercel.json
- ✅ Documentation files (README, DEPLOY, etc.)
- ✅ Img/ folder (images, wallpapers, videos)
- ✅ covers-main/ folder (game covers)
- ✅ assets-main/ folder (game files)

What DON'T upload (already in .gitignore):
- ❌ node_modules/ (too big, Vercel installs automatically)
- ❌ .env (local settings only)
- ❌ .vercel/ (Vercel's cache)

---

## 🎯 After Upload - Next Steps

### 1. Test on GitHub:
✅ Visit your repo: `github.com/YOUR-USERNAME/Nova`
✅ All files should be there

### 2. Deploy to Vercel:
✅ Import from GitHub
✅ One-click deploy
✅ Auto-updates when you push changes

### 3. Make Future Updates:
```bash
# Make changes to files
git add .
git commit -m "Updated games library"
git push
# Vercel auto-deploys! 🚀
```

---

## 🔥 Pro Tips

1. **Commit Often:**
   ```bash
   git add .
   git commit -m "Added new wallpapers"
   git push
   ```

2. **Good Commit Messages:**
   - ✅ "Fixed proxy connection issue"
   - ✅ "Added 5 new games"
   - ✅ "Updated background presets"
   - ❌ "changes"
   - ❌ "update"

3. **Check Status:**
   ```bash
   git status  # See what changed
   ```

4. **View History:**
   ```bash
   git log  # See all commits
   ```

---

## 🎉 You're Done!

After following these steps:
- ✅ Nova is on GitHub
- ✅ You can deploy to Vercel
- ✅ Auto-updates enabled
- ✅ Version control active

**Welcome to professional development!** 🚀

---

## 📚 Additional Resources

- [Git Basics](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Vercel Docs](https://vercel.com/docs)

---

**Questions? Just ask!** 😊
