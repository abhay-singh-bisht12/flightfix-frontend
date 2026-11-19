/**
 * Utility for exporting FlightFix Analytics datasets to CSV or formatted JSON.
 * Operates purely client-side without external dependencies.
 */

/**
 * Trigger browser download for text/csv or application/json blob.
 */
export function downloadFile(filename, content, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSV string.
 */
export function objectsToCSV(data, headers = null) {
  if (!data || !data.length) return '';
  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.map((k) => `"${k}"`).join(',');

  const rows = data.map((item) =>
    keys
      .map((k) => {
        const val = item[k] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\r\n');
}

/**
 * Export Key-Value dictionary (e.g. status counts) as CSV.
 */
export function dictToCSV(title, dict) {
  const lines = [`"${title} Category","Count"`];
  Object.entries(dict || {}).forEach(([key, val]) => {
    lines.push(`"${key}","${val}"`);
  });
  return lines.join('\r\n');
}

/**
 * Export full analytics report as formatted JSON.
 */
export function exportAnalyticsJSON(filename, data) {
  const content = JSON.stringify(data, null, 2);
  downloadFile(`${filename}_${new Date().toISOString().split('T')[0]}.json`, content, 'application/json');
}
