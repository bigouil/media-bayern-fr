import { NextResponse } from 'next/server';
import { getMatchesFromExcel, type ExcelMatch } from '@/lib/services/match-excel';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalider toutes les 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const excelMatches = await getMatchesFromExcel();
    let matches: ExcelMatch[] = excelMatches;

    if (matches.length === 0) {
      const matchesData = await import('@/lib/data/matches.json');
      matches = matchesData.default as ExcelMatch[];
    } else {
      switch (type) {
        case 'live':
          matches = matches
            .filter((match) => match.status === 'live')
            .slice(0, limit);
          break;
        case 'upcoming':
          matches = matches
            .filter((match) => match.status === 'scheduled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, limit);
          break;
        case 'recent':
          matches = matches
            .filter((match) => match.status === 'finished')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
          break;
        case 'all':
        default:
          matches = matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
      }

      if (type === 'live' && matches.length === 0) {
        matches = excelMatches.filter((match) => match.status === 'scheduled').slice(0, limit);
      }
    }

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
      source: 'excel',
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
