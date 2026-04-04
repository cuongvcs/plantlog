/**
 * ============================================================
 * PlantLog v3 — Google Apps Script Backend
 * ============================================================
 * HOW TO DEPLOY:
 * 1. Go to https://script.google.com
 * 2. Click "New project"
 * 3. Paste this entire file into the editor
 * 4. Click "Save" (Ctrl+S)
 * 5. Click "Deploy" → "New deployment"
 * 6. Type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone  (or "Anyone with Google account")
 * 9. Click "Deploy" → Copy the Web App URL
 * 10. Paste that URL into PlantLog app Settings → Google Sheet URL
 * ============================================================
 */

// ── CONFIG ──────────────────────────────────────────────────
const SHEET_NAME_TRIPS    = 'Trips';
const SHEET_NAME_TASKS    = 'Tasks';
const SHEET_NAME_LEAVE    = 'Leave';
const SHEET_NAME_REPORTS  = 'Reports';
const SHEET_NAME_CHECKLIST= 'Checklist';
const SHEET_NAME_READINGS = 'Readings';
const SHEET_NAME_ISSUES   = 'Issues';
const SHEET_NAME_TEAM     = 'Team';
const SHEET_NAME_LOG      = 'SyncLog';

// ── COLUMN DEFINITIONS ──────────────────────────────────────
const COLS = {
  trips:     ['ID','Plant','Location','Date','DateEnd','Purpose','Contact','Transport','Status','CreatedAt'],
  tasks:     ['ID','Title','Description','Date','Time','Priority','Status','TripID','CreatedAt','UpdatedAt'],
  leave:     ['Date','Type','Note'],
  reports:   ['TripID','SignoffSummary','SignoffResult','SignoffRemarks','SignedAt'],
  checklist: ['TripID','ItemID','Name','Result','Note'],
  readings:  ['TripID','Name','Tag','Value','Unit','Status','Notes'],
  issues:    ['TripID','Title','Description','Severity','Action','PhotoCount'],
  team:      ['TripID','Name','Role','Organization','SignoffRequired'],
  log:       ['Timestamp','Action','Entity','EntityID','Status','Details']
};

// ── ENTRY POINTS ─────────────────────────────────────────────

/**
 * HTTP GET — read data
 * ?action=getAll  → returns all data
 * ?action=getTrips
 * ?action=getTasks
 * ?action=getLeave
 */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'getAll';
    let data = {};

    if (action === 'getAll' || action === 'getTrips')    data.trips     = readSheet(SHEET_NAME_TRIPS,    COLS.trips);
    if (action === 'getAll' || action === 'getTasks')    data.tasks     = readSheet(SHEET_NAME_TASKS,    COLS.tasks);
    if (action === 'getAll' || action === 'getLeave')    data.leave     = readSheet(SHEET_NAME_LEAVE,    COLS.leave);
    if (action === 'getAll' || action === 'getReports')  data.reports   = readSheet(SHEET_NAME_REPORTS,  COLS.reports);
    if (action === 'getAll' || action === 'getChecklist')data.checklist = readSheet(SHEET_NAME_CHECKLIST,COLS.checklist);
    if (action === 'getAll' || action === 'getReadings') data.readings  = readSheet(SHEET_NAME_READINGS, COLS.readings);
    if (action === 'getAll' || action === 'getIssues')   data.issues    = readSheet(SHEET_NAME_ISSUES,   COLS.issues);
    if (action === 'getAll' || action === 'getTeam')     data.team      = readSheet(SHEET_NAME_TEAM,     COLS.team);

    return jsonResponse({ ok: true, data });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

/**
 * HTTP POST — write data
 * Body: { action: 'syncAll', payload: { trips:[], tasks:[], leave:{}, reports:{}, ... } }
 * Or:   { action: 'upsertTrip', payload: { trip object } }
 * Or:   { action: 'upsertTask', payload: { task object } }
 * Or:   { action: 'deleteTrip', payload: { id } }
 * Or:   { action: 'deleteTask', payload: { id } }
 */
function doPost(e) {
  try {
    const body    = JSON.parse(e.postData.contents);
    const action  = body.action;
    const payload = body.payload;
    let result    = {};

    switch (action) {
      case 'syncAll':
        result = syncAll(payload);
        break;
      case 'upsertTrip':
        result = upsertRow(SHEET_NAME_TRIPS, COLS.trips, payload, 'ID');
        logAction('UPSERT', 'Trip', payload.id || '');
        break;
      case 'upsertTask':
        result = upsertRow(SHEET_NAME_TASKS, COLS.tasks, payload, 'ID');
        logAction('UPSERT', 'Task', payload.id || '');
        break;
      case 'upsertLeave':
        result = upsertRow(SHEET_NAME_LEAVE, COLS.leave, payload, 'Date');
        logAction('UPSERT', 'Leave', payload.date || '');
        break;
      case 'deleteTrip':
        result = deleteRow(SHEET_NAME_TRIPS, 'ID', payload.id);
        cleanTripData(payload.id);
        logAction('DELETE', 'Trip', payload.id);
        break;
      case 'deleteTask':
        result = deleteRow(SHEET_NAME_TASKS, 'ID', payload.id);
        logAction('DELETE', 'Task', payload.id);
        break;
      case 'saveReport':
        result = saveReport(payload.tripId, payload.report);
        logAction('SAVE', 'Report', payload.tripId);
        break;
      case 'ping':
        result = { message: 'PlantLog API is running ✓', timestamp: new Date().toISOString() };
        break;
      default:
        return jsonResponse({ ok: false, error: 'Unknown action: ' + action });
    }

    return jsonResponse({ ok: true, result });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── SYNC ALL ─────────────────────────────────────────────────
function syncAll(payload) {
  const ss = getOrCreateSpreadsheet();
  const results = {};

  // Trips
  if (payload.trips && payload.trips.length) {
    clearAndWrite(ss, SHEET_NAME_TRIPS, COLS.trips, payload.trips.map(tr => [
      tr.id, tr.plant, tr.location||'', tr.date||'', tr.dateEnd||'',
      tr.purpose||'', tr.contact||'', tr.transport||'', tr.status||'planned',
      tr.createdAt||new Date().toISOString()
    ]));
    results.trips = payload.trips.length;
  }

  // Tasks
  if (payload.tasks && payload.tasks.length) {
    clearAndWrite(ss, SHEET_NAME_TASKS, COLS.tasks, payload.tasks.map(tk => [
      tk.id, tk.title, tk.desc||'', tk.date||'', tk.time||'',
      tk.priority||'medium', tk.status||'pending', tk.tripId||'',
      tk.createdAt||'', new Date().toISOString()
    ]));
    results.tasks = payload.tasks.length;
  }

  // Leave
  if (payload.leaveData && Object.keys(payload.leaveData).length) {
    const leaveRows = Object.entries(payload.leaveData).map(([date, type]) => [date, type, '']);
    clearAndWrite(ss, SHEET_NAME_LEAVE, COLS.leave, leaveRows);
    results.leave = leaveRows.length;
  }

  // Reports + sub-data
  if (payload.reports) {
    const reportRows = [], checkRows = [], readingRows = [], issueRows = [], teamRows = [];

    Object.entries(payload.reports).forEach(([tripId, rep]) => {
      if (!rep) return;

      // Report signoff
      reportRows.push([
        tripId,
        rep.signoff?.summary || '',
        rep.signoff?.result  || '',
        rep.signoff?.remarks || '',
        new Date().toISOString()
      ]);

      // Checklist
      (rep.checklist || []).forEach(item => {
        checkRows.push([tripId, item.id||'', item.name||'', item.result||'', item.note||'']);
      });

      // Readings
      (rep.readings || []).forEach(r => {
        readingRows.push([tripId, r.name||'', r.tag||'', r.value||'', r.unit||'', r.status||'', r.notes||'']);
      });

      // Issues
      (rep.issues || []).forEach(is => {
        issueRows.push([tripId, is.title||'', is.description||'', is.severity||'', is.action||'', (is.photos||[]).length]);
      });

      // Team
      (rep.team || []).forEach(m => {
        teamRows.push([tripId, m.name||'', m.role||'', m.org||'', m.signoff||'']);
      });
    });

    if (reportRows.length)  clearAndWrite(ss, SHEET_NAME_REPORTS,   COLS.reports,   reportRows);
    if (checkRows.length)   clearAndWrite(ss, SHEET_NAME_CHECKLIST,  COLS.checklist, checkRows);
    if (readingRows.length) clearAndWrite(ss, SHEET_NAME_READINGS,   COLS.readings,  readingRows);
    if (issueRows.length)   clearAndWrite(ss, SHEET_NAME_ISSUES,     COLS.issues,    issueRows);
    if (teamRows.length)    clearAndWrite(ss, SHEET_NAME_TEAM,       COLS.team,      teamRows);

    results.reports = reportRows.length;
  }

  logAction('SYNC_ALL', 'All', '', JSON.stringify(results));
  formatAllSheets(ss);
  return results;
}

// ── SAVE REPORT (single trip) ────────────────────────────────
function saveReport(tripId, rep) {
  const ss = getOrCreateSpreadsheet();

  // Remove existing rows for this trip
  [SHEET_NAME_REPORTS, SHEET_NAME_CHECKLIST, SHEET_NAME_READINGS,
   SHEET_NAME_ISSUES, SHEET_NAME_TEAM].forEach(name => {
    deleteRowsByValue(ss, name, 'TripID', tripId);
  });

  // Write new data
  const reportRow = [[tripId, rep.signoff?.summary||'', rep.signoff?.result||'', rep.signoff?.remarks||'', new Date().toISOString()]];
  appendRows(ss, SHEET_NAME_REPORTS, COLS.reports, reportRow);

  if (rep.checklist?.length) {
    appendRows(ss, SHEET_NAME_CHECKLIST, COLS.checklist,
      rep.checklist.map(i => [tripId, i.id||'', i.name||'', i.result||'', i.note||'']));
  }
  if (rep.readings?.length) {
    appendRows(ss, SHEET_NAME_READINGS, COLS.readings,
      rep.readings.map(r => [tripId, r.name||'', r.tag||'', r.value||'', r.unit||'', r.status||'', r.notes||'']));
  }
  if (rep.issues?.length) {
    appendRows(ss, SHEET_NAME_ISSUES, COLS.issues,
      rep.issues.map(i => [tripId, i.title||'', i.description||'', i.severity||'', i.action||'', (i.photos||[]).length]));
  }
  if (rep.team?.length) {
    appendRows(ss, SHEET_NAME_TEAM, COLS.team,
      rep.team.map(m => [tripId, m.name||'', m.role||'', m.org||'', m.signoff||'']));
  }

  return { saved: true, tripId };
}

// ── SHEET HELPERS ────────────────────────────────────────────
function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName('PlantLog Database');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create('PlantLog Database');
  Logger.log('Created new spreadsheet: ' + ss.getUrl());
  return ss;
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#1D9E75').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clearAndWrite(ss, sheetName, headers, rows) {
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  // Clear data rows only (keep header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function appendRows(ss, sheetName, headers, rows) {
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  rows.forEach(row => sheet.appendRow(row));
}

function readSheet(sheetName, headers) {
  const ss = getOrCreateSpreadsheet();
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const hdrs = data[0];
  return data.slice(1).filter(row => row[0] !== '').map(row => {
    const obj = {};
    hdrs.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function upsertRow(sheetName, headers, obj, keyCol) {
  const ss = getOrCreateSpreadsheet();
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  const keyIdx = headers.indexOf(keyCol);
  const keyVal = obj[keyCol.toLowerCase()] || obj[keyCol];
  const data = sheet.getDataRange().getValues();

  // Find existing row
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIdx] == keyVal) {
      const row = headers.map(h => obj[h.toLowerCase()] || obj[h] || '');
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      return { updated: true, row: i + 1 };
    }
  }
  // Append new
  const row = headers.map(h => obj[h.toLowerCase()] || obj[h] || '');
  sheet.appendRow(row);
  return { inserted: true };
}

function deleteRow(sheetName, keyCol, keyVal) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { notFound: true };
  const data = sheet.getDataRange().getValues();
  const keyIdx = data[0].indexOf(keyCol);
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][keyIdx] == keyVal) { sheet.deleteRow(i + 1); return { deleted: true }; }
  }
  return { notFound: true };
}

function deleteRowsByValue(ss, sheetName, col, val) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const colIdx = data[0].indexOf(col);
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][colIdx] == val) sheet.deleteRow(i + 1);
  }
}

function cleanTripData(tripId) {
  const ss = getOrCreateSpreadsheet();
  [SHEET_NAME_REPORTS, SHEET_NAME_CHECKLIST, SHEET_NAME_READINGS,
   SHEET_NAME_ISSUES, SHEET_NAME_TEAM].forEach(name => {
    deleteRowsByValue(ss, name, 'TripID', tripId);
  });
}

function logAction(action, entity, entityId, details) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEET_NAME_LOG, COLS.log);
    sheet.appendRow([new Date().toISOString(), action, entity, entityId, 'OK', details || '']);
  } catch(e) { /* silent */ }
}

function formatAllSheets(ss) {
  ss.getSheets().forEach(sheet => {
    if (sheet.getLastRow() > 0) {
      sheet.autoResizeColumns(1, sheet.getLastColumn());
    }
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── MANUAL SETUP TRIGGER ─────────────────────────────────────
// Run this once manually in Apps Script to create all sheets
function setupSheets() {
  const ss = getOrCreateSpreadsheet();
  Object.entries(COLS).forEach(([key, headers]) => {
    const name = {
      trips:'Trips',tasks:'Tasks',leave:'Leave',reports:'Reports',
      checklist:'Checklist',readings:'Readings',issues:'Issues',
      team:'Team',log:'SyncLog'
    }[key];
    getOrCreateSheet(ss, name, headers);
  });

  // Delete default "Sheet1" if empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);

  formatAllSheets(ss);
  Logger.log('✅ PlantLog Database ready: ' + ss.getUrl());
  return ss.getUrl();
}
