export type ImportedJob = {
  title: string;
  clientName: string;
  discipline: string;
  description: string;
  requirements: string[];
  rateMin: number;
  rateMax: number;
  rateUnit: "task" | "hour";
  hoursPerWeek: string;
  location: string;
  requiredQualityScore: number;
  openings: number;
};

function csvRows(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += character;
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error("The CSV contains an unclosed quoted value.");
  return rows;
}

function numberValue(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseJobsCsv(input: string): ImportedJob[] {
  if (input.length > 1_000_000) throw new Error("CSV imports are limited to 1 MB.");
  const rows = csvRows(input);
  if (rows.length < 2) throw new Error("Add a header row and at least one job.");
  if (rows.length > 201) throw new Error("Import no more than 200 jobs at a time.");
  const headers = rows[0].map((header) => header.replaceAll(/[\s_-]/g, "").toLowerCase());
  const required = ["title", "clientname", "discipline", "description"];
  for (const field of required) {
    if (!headers.includes(field)) throw new Error(`Missing required CSV column: ${field}.`);
  }
  const read = (row: string[], name: string) => row[headers.indexOf(name)] ?? "";
  return rows.slice(1).map((row, index) => {
    const title = read(row, "title");
    const clientName = read(row, "clientname");
    const discipline = read(row, "discipline");
    const description = read(row, "description");
    if (![title, clientName, discipline, description].every(Boolean)) {
      throw new Error(`Row ${index + 2} is missing a required value.`);
    }
    const rateUnit = read(row, "rateunit").toLowerCase() === "hour" ? "hour" : "task";
    return {
      title,
      clientName,
      discipline,
      description,
      requirements: read(row, "requirements").split("|").map((item) => item.trim()).filter(Boolean),
      rateMin: numberValue(read(row, "ratemin"), 0),
      rateMax: numberValue(read(row, "ratemax"), 0),
      rateUnit,
      hoursPerWeek: read(row, "hoursperweek"),
      location: read(row, "location") || "Remote",
      requiredQualityScore: Math.min(100, Math.max(0, numberValue(read(row, "requiredqualityscore"), 85))),
      openings: Math.max(1, Math.round(numberValue(read(row, "openings"), 1))),
    };
  });
}

export const JOB_CSV_TEMPLATE = "title,clientName,discipline,description,requirements,rateMin,rateMax,rateUnit,hoursPerWeek,location,requiredQualityScore,openings";
