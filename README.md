# 🏭 PlantLog v4

**Field Visit & Plant Report App** — A mobile-first PWA for field engineers and inspectors to plan plant visits, capture field data, manage daily tasks, track expenses, and export professional PDF reports — with full Google Sheets sync and offline support.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗓 Trip Planner | Create and edit plant visits with dates, location, purpose, transport, contact |
| 📋 Field Report | 6-step report: Checklist → Readings → Issues → Team → Tasks → Sign-off |
| ✅ Task Manager | Daily tasks with category, date/time, machine, plan, priority, sub-checklist |
| 💳 Bills | Dedicated tab for expense tracking with receipt photos, trip linking, totals |
| 🌴 Leave Planner | Calendar with trips, leave, WFH, holidays and task dots per day |
| 📄 Two PDF Reports | Field report PDF + standalone Bills/Expense report PDF |
| 📊 Google Sheets Sync | All data synced — trips, tasks, bills, leave, reports, machines, plans |
| 📷 Photo Evidence | Camera photos on issues and bill receipts |
| 👥 Team Sign-offs | Team members with roles and sign-off requirements per report |
| 🏭 Industry Templates | Pre-built checklists for 6 industries |
| 🔔 Notifications | Push reminders for upcoming trips and due tasks |
| 🇻🇳 / 🇬🇧 Language | Vietnamese / English toggle throughout the UI |
| 📱 PWA Install | Works offline, installs on Android and iPhone like a native app |

---

## 📁 Project Structure

```
plantlog/
├── src/
│   ├── index.html          ← Full app (self-contained single file)
│   ├── sw.js               ← Service worker for offline PWA
│   └── 404.html            ← GitHub Pages SPA redirect
├── scripts/
│   └── PlantLog_GoogleAppsScript.gs   ← Google Sheets backend
├── docs/
│   └── SETUP_GUIDE.md      ← Deployment & setup guide
├── .github/
│   └── workflows/
│       └── deploy.yml      ← Auto-deploy to GitHub Pages on push
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start

### Open directly
1. Download `src/index.html`
2. Open in Chrome (Android) or Safari (iPhone)
3. Tap **Install** when prompted

### Host on GitHub Pages (recommended)
1. Upload this project to a GitHub repository
2. Settings → Pages → Source: **GitHub Actions**
3. App goes live at `https://YOUR_USERNAME.github.io/plantlog/`

---

## 📊 Google Sheets Setup

1. Go to [script.google.com](https://script.google.com) → New project
2. Paste `scripts/PlantLog_GoogleAppsScript.gs` → Save
3. Run **`setupSheets`** once → approve permissions
4. Deploy → Web app → Execute as: Me → Access: **Anyone** → copy `/exec` URL
5. PlantLog → Settings → Google Sheets Sync → paste URL → **Sync all data**

### Sheets Created

| Sheet | Key Columns |
|---|---|
| Trips | ID, Plant, Location, Date, DateEnd, Purpose, Contact, Transport, Status |
| Tasks | ID, Title, Category, DateStart, TimeStart, DateEnd, TimeEnd, Hours, Minutes, Priority, Period, Machine, Plan, TripID, Status, Checklist, ChecklistJson |
| Leave | Date, Type |
| Bills | ID, TripID, Date, BillNumber, Detail, Amount, Currency, Category, PhotosJson |
| Reports | TripID, SignoffSummary, SignoffResult, SignoffRemarks |
| Checklist | TripID, Name, Result, Note |
| Readings | TripID, Type, Name, Tag, Value, Unit, Status, Condition |
| Issues | TripID, Title, Severity, IssueStatus, Action |
| Team | TripID, Name, Role, Organization, SignoffRequired |
| Machines / Plans | Name |
| SyncLog | Timestamp, Action, Entity, Status |

---

## 📄 PDF Reports

### Field Report PDF (per trip)
Report title · Plant & date · Engineer info · Checklist (Pass/Fail/N-A right-aligned) · Equipment readings (Condition or Measurement, right-aligned) · Issues (severity, status, photos) · Team · Selected tasks with work notes · Expense bills summary · Signed sign-off · Page numbers

### Bills PDF (standalone)
Grand total per currency · Bills grouped by date with subtotals · Receipt number · Detail · Category · Notes · Amount right-aligned · Embedded receipt photos · Grand total footer · Page numbers

---

## 📱 Install on Phone

**Android:** Chrome → ⋮ → Add to Home Screen  
**iPhone:** Safari → Share → Add to Home Screen

---

## 📝 Full Changelog

### v4.0 — Current release

**Bills tab (new)**
- Dedicated Bills screen in bottom navigation
- Add bills with: date, bill/receipt number, detail, amount, currency, category (Accommodation / Travel / Meals / Parts / Tools / Other), notes, receipt photos (up to 3)
- Link each bill to a trip from a dropdown
- View bills grouped by date or by trip
- Grand total summary card at the top, per currency
- ✏️ Edit and × delete any bill inline
- Standalone Bills PDF export with custom title, trip filter, day subtotals, grand total, embedded photos
- Email bills report with pre-filled summary
- All bill data synced to Google Sheets Bills tab including compressed photos (PhotosJson)

**Task fields expanded**
- Start date + time, end date + time
- Planned work hours + minutes
- Machine / equipment (custom dropdown, add new with +)
- Plan / project (custom dropdown, add new with +)
- Period (Daily / Weekly / Monthly / Yearly)
- Priority (Low / Medium / High / Critical)
- Sub-checklist: select from templates or type manually, mark done/undone
- Progress bar on task cards showing done/total
- Link to trip from dropdown
- All fields synced to Google Sheets including ChecklistJson for reliable reload

**Reading types in field report**
- Choose type before adding: **Condition** (OK / Not OK / Other — no value needed) or **Measurement** (value + unit + in-spec/out-of-range)
- Each reading shows its type label in the list

**Issue status tracking**
- Inline status buttons on each issue card: ⏳ Pending · 🔧 Waiting part · 🔄 Processing · ✅ Done
- Status saved in report and shown in PDF

**Edit trip**
- ✏️ Edit button in trip detail screen
- Edit any field: plant name, dates, location, purpose, transport, contact
- Trip detail card refreshes immediately

**Calendar day detail panel**
- Tap any calendar day to see everything scheduled: leave type banner, all trips that include that day, all tasks due that day with status icons
- Tap a trip to open it, cycle task status inline
- ＋ Add task for this day button pre-fills date

**Tasks in report (Step 5)**
- Pick any tasks to include in the report body
- Group by date in preview and PDF
- Add work notes per task (what was actually done)
- All/clear selection buttons
- Checklist progress bar per task in PDF

**Report PDF improvements**
- Report rename field — custom title appears in header and filename
- 3-line header: title · plant + date · engineer info
- Filename uses trip plant name + date only (clean)
- All values right-aligned using `getTextWidth()` for precision
- Issue status label (Pending/Processing/Done) right-aligned in PDF
- Normal font throughout — no italic/monospace for action lines
- Page numbers on every page (bottom-left: PlantLog · date; bottom-right: Page N)
- Bills section before sign-off

**Google Sheets sync fix (critical)**
- `readSheet()` in Apps Script now converts Date objects with `Utilities.formatDate()` → always returns `"yyyy-MM-dd"` strings
- `ensureSheet()` now compares and updates column headers on every sync — old sheets with wrong/missing columns are fixed automatically
- App-side `loadFromSheets()` uses `str()` helper to safely handle Date objects, numbers, and null values from the Sheet
- All task fields explicitly cast to `String()` in sync payload — prevents type loss
- ChecklistJson column stores full JSON array for reliable round-trip of sub-checklist items
- Photos compressed to 300px JPEG thumbnails before sync to keep payload small

**UI redesign**
- Font: IBM Plex Sans (body) + IBM Plex Sans Condensed (headers/titles) + IBM Plex Mono (tags)
- Color system: deeper greens (#00843D / #005C2B), refined neutrals, subtle amber/red/blue
- Topbar: gradient background with border-bottom, square back/action buttons
- Cards: 1px border + directional shadow, slight scale on press
- Badges: rectangular with 4px radius and matching border tint
- Form labels: all-caps condensed tracking
- Input focus: green border + soft green glow ring
- Modals: backdrop blur, heavier rounded sheet
- Toast: slide-up animation, square corners, deeper shadow
- Stats: condensed bold numbers
- Empty states: more breathing room, softer text

**Navigation**
- Bottom nav: Home · Trips · Tasks · **Bills** (new) · Settings
- Leave Planner moved to Settings → Leave / Calendar Planner entry

### v3.0

- 6-step field report (added Team and Tasks steps)
- Task Manager with list view and Kanban board
- Task categories: Work / Leave / Travel
- Leave calendar planner (Work trip / Leave / WFH / Holiday marking)
- Industry template presets for 6 industries
- Team members with sign-off requirements per report
- Photo evidence on issue findings
- Full Google Sheets sync (push + load) via Apps Script
- PWA service worker for offline support
- Vietnamese / English language toggle
- PDF: right-aligned values, page numbers, normal fonts
- 404.html for GitHub Pages SPA routing
- Checklist templates in Settings
- Default team members in Settings
- Machine and Plan dropdown lists with + new option

### v2.0

- Report rename: custom title for PDF before export
- Date fix: `fmtDate()` rewritten to prevent "Invalid Date"
- PDF header background changed to `#00843D`
- Auto-sync: every save triggers debounced Google Sheets sync (3s delay)
- CORS fix: POST uses `Content-Type: text/plain` to bypass preflight
- Issue status field in add-issue modal
- Reading type toggle (Condition vs Measurement)
- Edit trip button in trip detail
- Bills (initial): expense bills in trip detail, basic sync

### v1.0 — Initial Release

- Trip planner: create trips with plant, location, dates, purpose, transport
- 4-step field report: Checklist → Readings → Issues → Sign-off
- Inspection checklist: Pass / Fail / N-A per item with notes
- Equipment readings: value, unit, in-spec / out-of-range
- Issue reports: severity, action, description
- Signature pad: finger/stylus signature capture
- PDF export: full report with all sections and embedded signature
- Email report: pre-filled mailto with report summary
- Leave calendar: mark days with leave types
- Profile and settings: name, title, company, employee ID
- Checklist templates management
- PWA manifest: installable on Android and iPhone
- Push notifications: trip and task reminders

---

## 🔧 Troubleshooting

**Data missing after Load from Sheet** → Run `setupSheets()` again to update headers, then deploy new version, then sync.

**PDF not downloading on iPhone** → Tap and hold the PDF tab → Save to Files. Or email it first.

**Notifications not working on iPhone** → Must use hosted URL (GitHub Pages), not local file. Grant permission in Safari settings.

**Google Sheets returns empty** → Check Web App access is set to **Anyone** (not "Anyone with Google account"). Re-deploy after code changes.

---

*PlantLog v4.0 · Field Visit & Report App · MIT License*
