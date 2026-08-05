function ensureHeaders_(sheet) {
  const headers = ['number', 'name', 'phone', 'group', 'status', 'proof', 'reserved_at', 'confirmed_at', 'expires_at', 'created_at'];
  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const normalized = existing.map((value) => String(value || '').trim());

  if (!normalized.some(Boolean)) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return headers;
}

function buildRowValues_(headers, payload) {
  const values = Array(headers.length).fill('');
  const headersLower = headers.map((header) =>
    String(header || '')
      .trim()
      .toLowerCase(),
  );

  const setValue = (headerName, value) => {
    const index = headersLower.indexOf(String(headerName).trim().toLowerCase());
    if (index >= 0) {
      values[index] = value ?? '';
    }
  };

  setValue('number', payload.number ?? '');
  setValue('name', payload.name ?? '');
  setValue('phone', payload.phone ?? '');
  setValue('group', payload.group ?? '');
  setValue('status', payload.status ?? '');
  setValue('proof', payload.proof || payload.proof_url || '');
  setValue('reserved_at', payload.reserved_at ?? '');
  setValue('confirmed_at', payload.confirmed_at ?? '');
  setValue('expires_at', payload.expires_at ?? '');
  setValue('created_at', payload.created_at ?? '');

  return values;
}

function findRowIndexByNumber_(sheet, headers, number) {
  const data = sheet.getDataRange().getValues();
  if (!data.length) {
    return -1;
  }

  const numberIndex = headers.indexOf('number');
  if (numberIndex < 0) {
    return -1;
  }

  for (let rowIndex = 1; rowIndex < data.length; rowIndex += 1) {
    if (String(data[rowIndex][numberIndex] || '') === String(number)) {
      return rowIndex;
    }
  }

  return -1;
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const values = sheet.getDataRange().getValues();

  if (!values.length) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0].map((header) => String(header || '').trim());
  const rows = values
    .slice(1)
    .filter((row) => row.some((value) => value !== ''))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] ?? '';
      });
      return obj;
    });

  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = ensureHeaders_(sheet);
  const values = buildRowValues_(headers, payload);
  const number = payload.number ?? payload.id ?? '';
  const rowIndex = findRowIndexByNumber_(sheet, headers, number);

  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 1, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
