/**
 * Apps Script สำหรับซิงค์ Pokémon Full Art Checklist กับ Google Sheet
 * วิธีใช้: เปิดไฟล์ Google Sheet ของคุณ → ส่วนขยาย → Apps Script → วางโค้ดนี้ → Deploy → New deployment
 *   ประเภท Web app · Execute as: Me · Who has access: Anyone → คัดลอก URL ที่ลงท้าย /exec ไปใส่ในแอป
 * ชีตที่ต้องมี: 'Checklist 001-1025' (ไฟล์ xlsx ที่ทำไว้ อัปโหลดเข้า Google Sheet)
 * แท็บ 'Ticks' จะถูกสร้างอัตโนมัติ เพื่อเก็บว่าติ๊กตัวไหน
 */
var LIST_SHEET = 'Checklist 001-1025';
var TICK_SHEET = 'Ticks';

function readTicks_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(TICK_SHEET) || SpreadsheetApp.getActive().insertSheet(TICK_SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(['dex', 'checked', 'ts', 'own']);
  var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
  var t = {};
  rows.forEach(function (r) { if (r[0] !== '') t[String(r[0])] = [Number(r[1]), Number(r[2]), Number(r[3]) || 0]; });
  return { sh: sh, t: t };
}

function readList_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(LIST_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues(), out = [];
  v.forEach(function (r) {
    var no = String(r[0]).replace(/\D/g, '');
    var c = Number(r[3]) || 0;
    if (!no) return;
    out.push({
      d: Number(no), e: String(r[1]), j: String(r[2]), c: c,
      l: c > 0 ? String(r[4]).split(' ; ').map(function (s) { return s.trim(); }) : [],
      y: c > 0 ? String(r[5]).split(' ; ').map(function (s) { return s.trim(); }) : []
    });
  });
  return out;
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  var list = readList_();
  var ver = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, JSON.stringify(list)));
  return out_({ ticks: readTicks_().t, list: list, version: ver });
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
