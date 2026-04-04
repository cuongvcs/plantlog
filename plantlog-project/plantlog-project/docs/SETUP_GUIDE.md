# PlantLog — Complete Setup Guide

## Part 1: Install on Your Phone

### Android
1. Open Chrome on your phone
2. Go to your app URL (GitHub Pages link or local file)
3. A banner says **"Add PlantLog to Home Screen"** → tap it
4. Or tap ⋮ (3 dots) → **Add to Home Screen** → **Install**
5. App icon appears on your home screen — works like a native app!

### iPhone
1. Open Safari (must be Safari, not Chrome)
2. Go to your app URL
3. Tap the **Share button** (box with arrow pointing up)
4. Scroll down → **Add to Home Screen**
5. Tap **Add** — done!

---

## Part 2: Host on GitHub Pages (Free)

### Step 1 — Create GitHub Account
1. Go to [github.com](https://github.com) → Sign up
2. Choose a username (this becomes part of your app URL)

### Step 2 — Create Repository
1. Click **+** (top right) → **New repository**
2. Repository name: `plantlog`
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload Files
**Option A — Via browser (easiest):**
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop ALL files from this project
3. Keep the folder structure:
   ```
   src/index.html
   scripts/PlantLog_GoogleAppsScript.gs
   docs/SETUP_GUIDE.md
   .github/workflows/deploy.yml
   README.md
   .gitignore
   ```
4. Click **Commit changes**

**Option B — Via Git (if you have Git installed):**
```bash
cd plantlog-project
git init
git add .
git commit -m "Initial commit: PlantLog v3"
git remote add origin https://github.com/YOUR_USERNAME/plantlog.git
git branch -M main
git push -u origin main
```

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** tab
2. Left sidebar: **Pages**
3. Source: **GitHub Actions**
4. The workflow in `.github/workflows/deploy.yml` runs automatically
5. After ~2 minutes, your app is live at:
   **`https://YOUR_USERNAME.github.io/plantlog/`**

### Step 5 — Access on Phone
1. Open the URL on your phone
2. Install as PWA (see Part 1 above)
3. The app now works fully offline after first load!

---

## Part 3: Google Sheets Database

### What gets saved
| Sheet | Data |
|---|---|
| **Trips** | All plant visits |
| **Tasks** | All daily tasks |
| **Leave** | Leave calendar entries |
| **Reports** | Work sign-off summaries |
| **Checklist** | Inspection items per trip |
| **Readings** | Equipment readings per trip |
| **Issues** | Issue findings per trip |
| **Team** | Team members per trip |
| **SyncLog** | Auto-log of all sync actions |

### Create the Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New project** (top left)
3. Name your project: `PlantLog Backend`
4. Delete the default `function myFunction() {}` code
5. Open `scripts/PlantLog_GoogleAppsScript.gs` from this project
6. Copy ALL the code and paste it into the script editor
7. Press **Ctrl+S** to save

### Run Initial Setup

1. In the function dropdown (near the run button), select **`setupSheets`**
2. Click **▶ Run**
3. A popup asks for permissions — click **Review permissions**
4. Choose your Google account
5. Click **Advanced** → **Go to PlantLog Backend (unsafe)**
   *(This is your own script — it's safe)*
6. Click **Allow**
7. Check the **Execution log** at the bottom — you'll see:
   `✅ PlantLog Database ready: https://docs.google.com/spreadsheets/d/...`
8. Click that link to see your new Google Sheet!

### Deploy as Web App

1. Click **Deploy** (top right) → **New deployment**
2. Click the ⚙️ gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - **Description**: PlantLog API v1
   - **Execute as**: Me (your@email.com)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Click **Authorize access** if asked (same process as above)
6. **COPY THE WEB APP URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
   Save this URL — you'll need it in the app!

### Connect in PlantLog App

1. Open PlantLog on your phone
2. Go to ⚙️ **Settings**
3. Tap **Google Sheets Sync**
4. Paste your Web App URL
5. Tap **🔗 Test** — should show "Connected!"
6. Tap **⬆ Sync all data** — all your data goes to Google Sheets

### Auto-sync behavior
- After any save action, the app waits 5 seconds then auto-syncs
- You can always manually sync from Settings → Google Sheets Sync
- Use **⬇ Load from Sheet** to restore data on a new device

---

## Part 4: Updating the App

### Update via GitHub
1. Edit `src/index.html` in GitHub (click the file → pencil icon)
2. Make changes → **Commit changes**
3. GitHub Actions automatically redeploys in ~2 minutes
4. Refresh the app on your phone to get the update

### Re-deploy Apps Script after changes
1. Go back to script.google.com
2. Edit the code
3. Click **Deploy → Manage deployments**
4. Click the pencil icon → **New version**
5. Click **Deploy** — the URL stays the same

---

## Troubleshooting

**App won't install on phone:**
- Android: Must use Chrome browser
- iPhone: Must use Safari browser
- Make sure you're on HTTPS (GitHub Pages uses HTTPS automatically)

**Google Sheets sync fails:**
- Check the Web App URL is correct (ends in `/exec`)
- Make sure "Who has access" is set to "Anyone"
- Try re-deploying the script as a new version

**Data disappeared:**
- Data is in browser localStorage — clearing browser data removes it
- Always sync to Google Sheets as backup
- Use "Load from Sheet" to restore

**PDF download doesn't work on iPhone:**
- The PDF opens in a new tab — tap and hold → Save to Files
- Or email it to yourself first

---

*PlantLog v3.0 · Field Visit & Report App*
