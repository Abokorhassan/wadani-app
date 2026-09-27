// Shared helpers for the translation review workflow.
// No external dependencies — Node's built-ins only.

/** Flatten a nested object into dot-separated keys: { a: { b: 1 } } -> { "a.b": 1 }. */
export function flatten(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out[path] = value;
    }
  }
  return out;
}

/** Rebuild a nested object from dot-separated keys. Inverse of flatten(). */
export function unflatten(flat) {
  const root = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof node[part] !== 'object' || node[part] === null) node[part] = {};
      node = node[part];
    }
    node[parts[parts.length - 1]] = value;
  }
  return root;
}

/** Serialize a row of string fields to a single CSV line (RFC 4180 quoting). */
export function toCsvRow(fields) {
  return fields
    .map((field) => {
      const value = field ?? '';
      return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    })
    .join(',');
}

/** Parse a full CSV document into an array of string arrays (handles quotes/newlines). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  // Flush the trailing field/row unless the file ends on a clean newline.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Placeholders like {{name}} that must survive a translation unchanged. */
export function placeholders(value) {
  if (typeof value !== 'string') return [];
  return (value.match(/\{\{[^}]+\}\}/g) ?? []).sort();
}
