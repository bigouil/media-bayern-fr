// app/api/players/stats/route.ts
import { NextResponse } from "next/server";
import playersData from "@/lib/data/players.json";

const players = playersData as PlayerRecord[];

interface PlayerRecord {
  id: string;
  name: string;
  nation: string;
  position: string;
  age: number;
  metrics: {
    matches: number;
    starts: number;
    minutes: number;
    nineties: number;
  };
  performance: {
    goals: number;
    assists: number;
    goalContrib: number;
    nonPenGoals: number;
    penGoals: number;
    penAttempts: number;
    yellowCards: number;
    redCards: number;
  };
  expected: {
    xg: number;
    npxg: number;
    xag: number;
    npxgPlusXag: number;
  };
  progression: {
    progressiveCarries: number;
    progressivePasses: number;
    progressiveReceptions: number;
  };
  per90: {
    goals: number;
    assists: number;
    goalContrib: number;
    nonPenGoals: number;
    goalContribMinusPk: number;
    xg: number;
    xag: number;
    xgPlusXag: number;
    npxg: number;
    npxgPlusXag: number;
  };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    source: "Bayern Standard Stats 2025-2026 (Bundesliga)",
    lastUpdate: new Date().toISOString(),
    data: players,
  });
}
