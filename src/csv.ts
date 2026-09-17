export function parseCsv(content: string): unknown[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const firstLine = lines[0];
  if (!firstLine) return [];

  const header = firstLine.split(",").map((h) => h.trim().toLowerCase());
  const idIndex = header.indexOf("id");
  const areaIndex = header.indexOf("area");
  const priorityIndex = header.indexOf("priority");
  const weightIndex = header.indexOf("weight");

  if (
    idIndex === -1 ||
    areaIndex === -1 ||
    priorityIndex === -1 ||
    weightIndex === -1
  ) {
    return [];
  }

  const rows: unknown[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i] ?? "";

    const cells = line.split(",").map((c) => c.trim());

    rows.push({
      id: cells[idIndex],
      area: cells[areaIndex],
      priority: cells[priorityIndex],
      weight: cells[weightIndex],
    });
  }

  return rows;
}
