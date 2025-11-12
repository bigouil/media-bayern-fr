import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/api/football-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Pas de cache pour les matchs en direct

export async function GET() {
  try {
    const matches = await getLiveMatches();

    return NextResponse.json({
      success: true,
      data: matches,
      isLive: matches.length > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in live matches API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch live matches',
      },
      { status: 500 }
    );
  }
}
