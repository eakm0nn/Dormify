export const csvCell = (value: string | number) => {
  const text = String(value);
  const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
};
export const downloadCsv = (
  headers: string[],
  rows: (string | number)[][],
  name = 'dormify-report',
) => {
  const text = '\uFEFF' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name + '.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
