import { NextResponse } from 'next/server';
import { getBayernMatches, getUpcomingMatches, getRecentMatches, getLiveMatches } from '@/lib/api/football-data';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalider toutes les 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const season = searchParams.get('season') || new Date().getFullYear().toString();
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    let matches;

    switch (type) {
      case 'live':
        matches = await getLiveMatches();
        break;
      case 'upcoming':
        matches = await getUpcomingMatches(limit);
        break;
      case 'recent':
        matches = await getRecentMatches(limit);
        break;
      case 'all':
      default:
        matches = await getBayernMatches(season);
        break;
    }

    // Si aucune donnée n'est disponible, fallback vers les données locales
    if (matches.length === 0) {
      const matchesData = await import('@/lib/data/matches.json');
      matches = matchesData.default;
    }

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
      source: 'football-data.org',
      rateLimit: '10 requêtes/minute',
    });
  } catch (error) {
    console.error('Error in matches API:', error);

    // Fallback vers les données locales en cas d'erreur
    try {
      const matchesData = await import('@/lib/data/matches.json');
      return NextResponse.json({
        success: true,
        data: matchesData.default,
        count: matchesData.default.length,
        fallback: true,
        note: 'Utilisation des données locales (API non disponible)',
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch matches',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}
