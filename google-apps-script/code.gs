/**
 * NEMS BATCH 2024-2025 REUNION CELEBRATION - GOOGLE APPS SCRIPT BACKEND
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) and create a new Spreadsheet named "NEMS Reunion RSVPs".
 * 2. Click Extensions -> Apps Script.
 * 3. Replace all code in Code.gs with this entire script.
 * 4. Click Deploy -> New Deployment.
 * 5. Select type: Web App.
 * 6. Set "Execute as": Me.
 * 7. Set "Who has access": Anyone.
 * 8. Click Deploy, authorize access, and copy the Web App URL!
 * 9. Paste the Web App URL into script.js or via the Admin Portal URL setup.
 */

// Handle POST requests from RSVP form
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    
    // Ensure Header Row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Full Name", "Phone / WhatsApp", "Attendance Status", "Payment Method", "Notes / Message", "Timestamp"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#D4AF37").setFontColor("#FFFFFF");
    }

    var data;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }

    var fullName = data.fullName || "Anonymous";
    var phone = data.phone || "-";
    var attendanceStatus = data.attendanceStatus || "Attending";
    var paymentMethod = data.paymentMethod || "GPay";
    var notes = data.notes || "";
    var timestamp = data.timestamp || new Date().toLocaleString();

    sheet.appendRow([fullName, phone, attendanceStatus, paymentMethod, notes, timestamp]);

    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "RSVP recorded successfully!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Handle GET requests to retrieve guest list for Admin Panel
function doGet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    var rows = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }

    // Skip header row
    var data = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      data.push({
        fullName: row[0],
        phone: row[1],
        attendanceStatus: row[2],
        paymentMethod: row[3],
        notes: row[4],
        timestamp: row[5]
      });
    }

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}