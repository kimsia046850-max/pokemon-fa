/**
 * Apps Script สำหรับซิงค์ Pokémon Full Art Checklist กับ Google Sheet
 * วิธีใช้: เปิดไฟล์ Google Sheet ของคุณ → ส่วนขยาย → Apps Script → วางโค้ดนี้ → Deploy → New deployment
 *   ประเภท Web app · Execute as: Me · Who has access: Anyone → คัดลอก URL ที่ลงท้าย /exec ไปใส่ในแอป
 * ชีตที่ต้องมี (จากไฟล์ xlsx ที่ทำไว้): 'Checklist 001-1025', 'Mega Dex', 'Regional Forms', 'Gigantamax Dex', 'รายชุด Full Art' (ราคา)
 * แท็บ 'Ticks' จะถูกสร้างอัตโนมัติ เพื่อเก็บว่าติ๊กตัวไหน
 */
var LIST_SHEET = 'Checklist 001-1025';
var TICK_SHEET = 'Ticks';
var PRICE_SHEET = 'รายชุด Full Art';

function readTicks_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(TICK_SHEET) || SpreadsheetApp.getActive().insertSheet(TICK_SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(['dex', 'checked', 'ts', 'own']);
  var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
  var t = {};
  rows.forEach(function (r) { if (r[0] !== '') t[String(r[0])] = [Number(r[1]), Number(r[2]), Number(r[3]) || 0]; });
  return { sh: sh, t: t };
}

function splitS_(v) { return String(v).split(' ; ').map(function (s) { return s.trim(); }).filter(function (s) { return s; }); }

function sheetRows_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(sh.getLastColumn(), 10)).getValues();
}

// หน้า Pokédex: แท็บ 'Checklist 001-1025' (A No., B EN, C JP, D จำนวน, E รายการ, F ปี, H ชื่อไทย)
function readList_() {
  var out = [];
  sheetRows_(LIST_SHEET).forEach(function (r) {
    var no = String(r[0]).replace(/\D/g, ''), c = Number(r[3]) || 0;
    if (!no) return;
    out.push({ d: Number(no), e: String(r[1]), j: String(r[2]), t: String(r[7] || ''), c: c,
      l: c > 0 ? splitS_(r[4]) : [], y: c > 0 ? splitS_(r[5]) : [] });
  });
  return out;
}

// หน้า Mega / Regional / Gigantamax: A รหัสฟอร์ม (เช่น M10033), B No. ตัวหลัก, C EN, D JP, E ไทย, F จำนวน, G รายการ, H ปี
function readForms_(name) {
  var out = [];
  sheetRows_(name).forEach(function (r) {
    var k = String(r[0]); if (!k) return;
    var c = Number(r[5]) || 0;
    out.push({ k: k, b: Number(String(r[1]).replace(/\D/g, '')), s: Number(k.replace(/\D/g, '')), e: String(r[2]), j: String(r[3]),
      t: String(r[4] || ''), c: c, l: c > 0 ? splitS_(r[6]) : [], y: c > 0 ? splitS_(r[7]) : [] });
  });
  return out;
}

// ราคา: แท็บ 'รายชุด Full Art' (B รหัสชุด, E เลขการ์ด, J ราคา ¥)
function readPrices_() {
  var p = {};
  sheetRows_(PRICE_SHEET).forEach(function (r) {
    var pr = Number(r[9]);
    if (r[1] !== '' && pr > 0) p[String(r[1]) + '|' + String(r[4])] = { y: pr };
  });
  return { date: 'จาก Google Sheet', src: { y: 'Yuyu-tei' }, p: p };
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  var lists = { dex: readList_(), mega: readForms_('Mega Dex'), reg: readForms_('Regional Forms'), gmax: readForms_('Gigantamax Dex') };
  var prices = readPrices_();
  var ver = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, JSON.stringify([lists, prices])));
  return out_({ ticks: readTicks_().t, lists: lists, prices: prices, version: ver });
}

function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents), inc = body.ticks || {};
    var o = readTicks_(), changed = false;
    Object.keys(inc).forEach(function (d) {
      if (!o.t[d] || inc[d][1] > o.t[d][1]) { o.t[d] = inc[d]; changed = true; }
    });
    if (changed) {
      var rows = Object.keys(o.t).sort().map(function (d) { return [String(d), o.t[d][0], o.t[d][1], o.t[d][2] || 0]; });
      o.sh.clearContents(); o.sh.appendRow(['dex', 'checked', 'ts', 'own']);
      if (rows.length) o.sh.getRange(2, 1, rows.length, 4).setValues(rows);
    }
    return out_({ ok: true, n: Object.keys(o.t).length });
  } finally { lock.release(); }
}
