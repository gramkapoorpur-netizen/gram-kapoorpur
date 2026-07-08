const ADMIN_TOKEN_PROPERTY = "ADMIN_TOKEN";

const SHEETS = {
  notices: {
    name: "notices",
    editable: true,
    headers: ["title_hi", "title_en", "body_hi", "body_en", "date", "type_hi", "type_en", "important", "status"]
  },
  events: {
    name: "events",
    editable: true,
    headers: ["title_hi", "title_en", "date", "time", "place_hi", "place_en", "details_hi", "details_en", "status"]
  },
  directory: {
    name: "directory",
    editable: true,
    headers: ["name_hi", "name_en", "role_hi", "role_en", "phone", "category", "status"]
  },
  gallery: {
    name: "gallery",
    editable: true,
    headers: ["title_hi", "title_en", "image", "caption_hi", "caption_en", "status"]
  },
  users: {
    name: "users",
    editable: true,
    headers: ["name", "phone", "email", "role", "village", "notes", "status"]
  },
  messages: {
    name: "Messages",
    editable: false,
    headers: ["Received At", "Name", "Phone", "Topic", "Message", "Language", "Page", "Created At"]
  }
};

function doPost(e) {
  const data = parseBody_(e);

  if (data.action && String(data.action).indexOf("admin_") === 0) {
    return handleAdmin_(data);
  }

  return savePublicMessage_(data);
}

function doGet() {
  return json_({
    ok: true,
    message: "Gram Kapoorpur endpoint is active."
  });
}

function setupAdminToken() {
  PropertiesService.getScriptProperties().setProperty(
    ADMIN_TOKEN_PROPERTY,
    "change-this-to-a-long-private-token"
  );
}

function handleAdmin_(data) {
  if (!isAdminTokenValid_(data.token)) {
    return json_({
      ok: false,
      error: "Invalid or missing admin token."
    });
  }

  try {
    if (data.action === "admin_list") {
      return json_({
        ok: true,
        data: listSheets_(data.sheets || Object.keys(SHEETS))
      });
    }

    if (data.action === "admin_upsert") {
      upsertRow_(data.sheet, data.rowNumber, data.values || {});
      return json_({ ok: true });
    }

    if (data.action === "admin_hide") {
      hideRow_(data.sheet, data.rowNumber);
      return json_({ ok: true });
    }

    if (data.action === "admin_delete") {
      deleteRow_(data.sheet, data.rowNumber);
      return json_({ ok: true });
    }

    return json_({
      ok: false,
      error: "Unknown admin action."
    });
  } catch (error) {
    return json_({
      ok: false,
      error: error.message
    });
  }
}

function savePublicMessage_(data) {
  const sheet = ensureSheet_("messages");

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.phone || "",
    data.topic || "",
    data.message || "",
    data.lang || "",
    data.page || "",
    data.createdAt || ""
  ]);

  return json_({ ok: true });
}

function listSheets_(sheetKeys) {
  const result = {};

  sheetKeys.forEach(function (sheetKey) {
    if (!SHEETS[sheetKey]) return;
    const sheet = ensureSheet_(sheetKey);
    result[sheetKey] = readSheet_(sheetKey, sheet);
  });

  return result;
}

function readSheet_(sheetKey, sheet) {
  const headers = getHeaders_(sheetKey, sheet);
  const lastRow = sheet.getLastRow();
  const rows = [];

  if (lastRow >= 2) {
    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();

    values.forEach(function (row, index) {
      const object = {};
      headers.forEach(function (header, columnIndex) {
        object[header] = row[columnIndex] || "";
      });

      rows.push({
        rowNumber: index + 2,
        object: object
      });
    });
  }

  return {
    headers: headers,
    rows: rows
  };
}

function upsertRow_(sheetKey, rowNumber, values) {
  const spec = getSheetSpec_(sheetKey);
  if (!spec.editable) throw new Error("This sheet is read only.");

  const sheet = ensureSheet_(sheetKey);
  const headers = getHeaders_(sheetKey, sheet);
  const rowValues = headers.map(function (header) {
    return values[header] || "";
  });

  if (rowNumber) {
    const row = Number(rowNumber);
    if (!row || row < 2 || row > sheet.getLastRow()) throw new Error("Invalid row number.");
    sheet.getRange(row, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function hideRow_(sheetKey, rowNumber) {
  const spec = getSheetSpec_(sheetKey);
  if (!spec.editable) throw new Error("This sheet is read only.");

  const sheet = ensureSheet_(sheetKey);
  const headers = getHeaders_(sheetKey, sheet);
  const statusColumn = ensureStatusColumn_(sheet, headers);
  const row = Number(rowNumber);

  if (!row || row < 2 || row > sheet.getLastRow()) throw new Error("Invalid row number.");
  sheet.getRange(row, statusColumn).setValue("hidden");
}

function deleteRow_(sheetKey, rowNumber) {
  const spec = getSheetSpec_(sheetKey);
  if (!spec.editable) throw new Error("This sheet is read only.");

  const sheet = ensureSheet_(sheetKey);
  const row = Number(rowNumber);

  if (!row || row < 2 || row > sheet.getLastRow()) throw new Error("Invalid row number.");
  sheet.deleteRow(row);
}

function ensureSheet_(sheetKey) {
  const spec = getSheetSpec_(sheetKey);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(spec.name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(spec.name);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(spec.headers);
  } else {
    const firstCell = sheet.getRange(1, 1).getDisplayValue();
    if (!firstCell) {
      sheet.getRange(1, 1, 1, spec.headers.length).setValues([spec.headers]);
    }
  }

  return sheet;
}

function getHeaders_(sheetKey, sheet) {
  const spec = getSheetSpec_(sheetKey);
  const width = Math.max(sheet.getLastColumn(), spec.headers.length);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0]
    .map(function (header) {
      return String(header || "").trim();
    })
    .filter(Boolean);

  if (!headers.length) {
    sheet.getRange(1, 1, 1, spec.headers.length).setValues([spec.headers]);
    return spec.headers.slice();
  }

  return headers;
}

function ensureStatusColumn_(sheet, headers) {
  const currentIndex = headers.indexOf("status");
  if (currentIndex !== -1) return currentIndex + 1;

  const nextColumn = headers.length + 1;
  sheet.getRange(1, nextColumn).setValue("status");
  return nextColumn;
}

function getSheetSpec_(sheetKey) {
  const spec = SHEETS[sheetKey];
  if (!spec) throw new Error("Unknown sheet: " + sheetKey);
  return spec;
}

function isAdminTokenValid_(token) {
  const savedToken = PropertiesService.getScriptProperties().getProperty(ADMIN_TOKEN_PROPERTY);
  return Boolean(savedToken) && String(token || "") === savedToken;
}

function parseBody_(e) {
  if (!e) return {};

  if (e.parameter && e.parameter.payload) {
    try {
      return JSON.parse(e.parameter.payload);
    } catch (error) {
      return {};
    }
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return e.parameter || {};
    }
  }

  return e.parameter || {};
}

function json_(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
