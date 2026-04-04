# 🏭 PlantLog v3

**Field Visit & Plant Report App** — A mobile-first PWA for engineers and inspectors to plan plant visits, record field data, manage daily tasks, and export signed PDF reports.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📅 Trip Planner | Plan plant visits with location, purpose, transport & contact |
| 📋 Field Report | 5-step report: Checklist → Readings → Issues → Team → Sign-off |
| ✅ Task Manager | Daily tasks with Pending / In Progress / Done + Kanban board |
| 🌴 Leave Planner | Calendar with work trips, leave, WFH, holidays |
| 📄 PDF Export | Full signed report with photos embedded |
| ✉️ Email Report | Pre-filled email template with report summary |
| 📷 Photo Evidence | Attach camera photos to issues |
| 👥 Team Sign-offs | Add team members and supervisors to each report |
| 🏭 Industry Templates | Pre-built checklists for 6 industries |
| 📊 Google Sheets Sync | Backup all data to your Google Sheet automatically |
| 🔔 Push Notifications | Reminders for upcoming trips and due tasks |
| 🇻🇳 / 🇬🇧 Language | Vietnamese / English toggle |
| 📱 PWA Install | Install on phone like a native app (works offline) |

---

## 🚀 Quick Start

### Option 1 — Open directly in browser
1. Download `src/index.html`
2. Open in Chrome or Safari on your phone
3. Tap **Install** when prompted (Android) or Share → Add to Home Screen (iPhone)

### Option 2 — Host on GitHub Pages (recommended)
1. Fork this repository
2. Go to **Settings → Pages**
3. Source: `main` branch, folder `/src`
4. Your app will be live at: `https://YOUR_USERNAME.github.io/plantlog/`

---

## 📊 Google Sheets Setup

### Step 1 — Create the Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. Delete all default code
4. Copy the contents of `scripts/PlantLog_GoogleAppsScript.gs`
5. Paste into the editor
6. Click **Save** (Ctrl+S), name it "PlantLog Backend"

### Step 2 — Run initial setup

1. In the editor, select function `setupSheets` from the dropdown
2. Click **▶ Run**
3. Approve permissions when asked
4. Check **Execution log** — you'll see the Google Sheet URL

### Step 3 — Deploy as Web App

1. Click **Deploy → New deployment**
2. Click ⚙️ gear icon → **Web app**
3. Fill in:
   - Description: `PlantLog API`
   - Execute as: **Me**
   - Who has access: **Anyone** (or "Anyone with Google account")
4. Click **Deploy**
5. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)

### Step 4 — Connect in the app

1. Open PlantLog → **Settings → Google Sheets Sync**
2. Paste the Web App URL
3. Tap **Test** to verify
4. Tap **Sync all data** to push your data to Google Sheets

---

## 📁 Project Structure

```
plantlog/
├── src/
│   └── index.html          # Main app (single HTML file, self-contained)
├── scripts/
│   └── PlantLog_GoogleAppsScript.gs   # Google Apps Script backend
├── docs/
│   └── SETUP_GUIDE.md      # Detailed setup instructions
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy to GitHub Pages
├── README.md
└── .gitignore
```

---

## 📱 Installing on Your Phone

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **"Install"** banner at the bottom
3. Or: tap ⋮ menu → **Add to Home Screen**

### iPhone (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down → **Add to Home Screen**
4. Tap **Add**

---

## 🔔 Notifications

- Open the app → tap **"Enable notifications"** banner on home screen
- Or: Settings → Notifications → Allow
- You'll get reminders for:
  - Trips scheduled for **today or tomorrow**
  - Tasks due **today or tomorrow**

> **Note:** Notifications require the app to be open or recently used. For background notifications, host the app and add a Service Worker (see `docs/SETUP_GUIDE.md`).

---

## 🏭 Supported Industries

| Industry | Items |
|---|---|
| 🛢️ Oil & Gas | Pressure valves, pipeline inspection, flare stack, emergency shutdown... |
| ⚡ Power Plant | Generator readings, transformer oil, circuit breakers, turbine temp... |
| 🏭 Manufacturing | Machine guarding, conveyors, hydraulics, air compressors... |
| ⚗️ Chemical Plant | Storage labeling, pressure vessels, eyewash stations, scrubbers... |
| 💧 Water Treatment | Chlorine dosing, pH meters, UV units, SCADA status... |
| 🍱 Food Processing | Temperature loggers, CIP system, allergen checks, metal detectors... |

---

## 🛠 Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript (no framework, no build step)
- **Storage**: Browser localStorage (offline-first)
- **Cloud backup**: Google Apps Script + Google Sheets
- **PDF**: jsPDF (CDN)
- **Fonts**: DM Sans + Be Vietnam Pro (Google Fonts)
- **PWA**: Web App Manifest + meta tags

---

## 📄 License

MIT License — free to use and modify for personal and commercial projects.

---

*Built with PlantLog v3.0 · Field Visit & Report App*
