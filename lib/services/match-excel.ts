import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

export interface ExcelMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  competition: string;
  stadium: string;
  status: "finished" | "scheduled" | "live";
  round?: string;
  isLive?: boolean;
}

type RawExcelRow = {
  Date?: string | number | Date;
  Time?: string | number | Date;
  "Compétition"?: string;
  Competition?: string;
  Round?: string;
  Lieu?: string;
  Résultat?: string;
  GF?: number;
  GA?: number;
  Opponent?: string;
};

function normalizeDate(dateValue?: string | number | Date, timeValue?: string | number | Date) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  const baseDate = new Date(dateValue);

  if (timeValue instanceof Date) {
    baseDate.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);
  } else if (typeof timeValue === "number") {
    // Excel stores time as fraction of a day
    const totalMinutes = Math.round(timeValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    baseDate.setHours(hours, minutes, 0, 0);
  } else if (typeof timeValue === "string" && timeValue.trim().length > 0) {
    const [hours, minutes] = timeValue.split(":").map((part) => parseInt(part, 10));
    if (!Number.isNaN(hours)) {
      baseDate.setHours(hours, minutes || 0, 0, 0);
    }
  }

  return baseDate.toISOString();
}

function normalizeString(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export async function getMatchesFromExcel(): Promise<ExcelMatch[]> {
  try {
    const filePath = path.join(process.cwd(), "Scores & Fixtures.xlsx");
    const buffer = await fs.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: RawExcelRow[] = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
    });

    const now = new Date();

    return rows
      .filter((row) => row.Date)
      .map((row, index) => {
        const opponent = normalizeString(row.Opponent) || "Adversaire à définir";
        const competition =
          normalizeString(row["Compétition"]) || normalizeString(row.Competition) || "Match";
        const round = normalizeString(row.Round);
        const location = normalizeString(row.Lieu).toLowerCase();
        const gf = typeof row.GF === "number" ? row.GF : null;
        const ga = typeof row.GA === "number" ? row.GA : null;

        const dateIso = normalizeDate(row.Date, row.Time);
        const matchDate = new Date(dateIso);

        const isFinished = gf !== null && ga !== null;
        const status: "finished" | "scheduled" | "live" = isFinished
          ? "finished"
          : matchDate > now
          ? "scheduled"
          : "live";

        const bayernIsHome = location === "home" || location === "domicile";
        const homeTeam = bayernIsHome ? "FC Bayern Munich" : opponent;
        const awayTeam = bayernIsHome ? opponent : "FC Bayern Munich";

        const homeScore = isFinished
          ? bayernIsHome
            ? gf
            : ga
          : null;
        const awayScore = isFinished
          ? bayernIsHome
            ? ga
            : gf
          : null;

        return {
          id: `excel-${index}-${dateIso}`,
          homeTeam,
          awayTeam,
          homeScore,
          awayScore,
          date: dateIso,
          competition,
          stadium: location ? `Match ${location}` : "À confirmer",
          status,
          round: round || undefined,
          isLive: status === "live",
        };
      });
  } catch (error) {
    console.error("Error reading Scores & Fixtures.xlsx:", error);
    return [];
  }
}
