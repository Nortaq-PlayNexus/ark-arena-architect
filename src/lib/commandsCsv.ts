/**
 * RFC-style CSV (one column) for exporting spawn/summon lines into spreadsheets.
 */
export function escapeCsvField(value: string): string {
  const needsQuotes = /[",\r\n]/.test(value);
  const doubled = value.replace(/"/g, '""');
  return needsQuotes ? `"${doubled}"` : doubled;
}

/** Header row + one escaped field per command line. */
export function buildCommandsCsvContent(commands: string[]): string {
  const header = escapeCsvField("command");
  const body = commands.map((c) => escapeCsvField(c)).join("\r\n");
  return `${header}\r\n${body}\r\n`;
}
