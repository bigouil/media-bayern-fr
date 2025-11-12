// Configuration API Football
// Inscrivez-vous sur https://www.api-football.com/
// Plan gratuit : 100 requêtes/jour

const API_KEY = process.env.FOOTBALL_API_KEY || '';
const API_BASE_URL = 'https://v3.football.api-sports.io';
const BAYERN_TEAM_ID = 157; // ID du Bayern Munich

interface ApiMatch {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string; // "FT", "NS", "LIVE", etc.
    };
    venue: {
      name: string;
    };
  };
  league: {
    name: string;
    logo: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

async function fetchFromAPI(endpoint: string) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    next: {
      revalidate: 300, // Cache pour 5 minutes
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

export async function getBayernMatches(season: number = 2023) {
  try {
    // ⚠️ Plan gratuit : seulement saisons 2021-2023 disponibles
    // Pour la saison actuelle 2024-2025, il faut un plan payant
    const matches = await fetchFromAPI(
      `/fixtures?team=${BAYERN_TEAM_ID}&season=${season}`
    );
    return matches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching Bayern matches:', error);
    return [];
  }
}

export async function getLiveMatches() {
  try {
    const matches = await fetchFromAPI(`/fixtures?team=${BAYERN_TEAM_ID}&live=all`);
    return matches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

export async function getUpcomingMatches(limit: number = 5) {
  try {
    const matches = await fetchFromAPI(
      `/fixtures?team=${BAYERN_TEAM_ID}&next=${limit}`
    );
    return matches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}

export async function getRecentMatches(limit: number = 5) {
  try {
    // Le paramètre "last" n'est pas disponible dans le plan gratuit
    // On récupère tous les matchs de la saison et on filtre
    const currentYear = new Date().getFullYear();
    const season = new Date().getMonth() >= 7 ? currentYear : currentYear - 1; // Saison commence en août

    const matches = await fetchFromAPI(
      `/fixtures?team=${BAYERN_TEAM_ID}&season=${season}`
    );

    // Filtrer les matchs terminés et trier par date décroissante
    const finishedMatches = matches
      .filter((m: ApiMatch) => ['FT', 'AET', 'PEN'].includes(m.fixture.status.short))
      .sort((a: ApiMatch, b: ApiMatch) =>
        new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
      )
      .slice(0, limit);

    return finishedMatches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

export async function getMatchById(fixtureId: number) {
  try {
    const matches = await fetchFromAPI(`/fixtures?id=${fixtureId}`);
    return matches.length > 0 ? transformMatch(matches[0]) : null;
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}

// Transformer les données de l'API vers notre format
function transformMatch(apiMatch: ApiMatch) {
  const isFinished = ['FT', 'AET', 'PEN'].includes(apiMatch.fixture.status.short);
  const isLive = apiMatch.fixture.status.short === 'LIVE';

  return {
    id: `match-${apiMatch.fixture.id}`,
    homeTeam: apiMatch.teams.home.name,
    awayTeam: apiMatch.teams.away.name,
    homeScore: isFinished || isLive ? apiMatch.goals.home : null,
    awayScore: isFinished || isLive ? apiMatch.goals.away : null,
    date: apiMatch.fixture.date,
    competition: apiMatch.league.name,
    stadium: apiMatch.fixture.venue.name,
    status: isFinished ? 'finished' : isLive ? 'live' : 'scheduled',
    isLive,
    leagueLogo: apiMatch.league.logo,
    homeTeamLogo: apiMatch.teams.home.logo,
    awayTeamLogo: apiMatch.teams.away.logo,
  };
}

// Fonction pour récupérer les statistiques de l'équipe
export async function getBayernStats(season: number = 2024) {
  try {
    const stats = await fetchFromAPI(
      `/teams/statistics?team=${BAYERN_TEAM_ID}&season=${season}&league=78` // 78 = Bundesliga
    );
    return stats;
  } catch (error) {
    console.error('Error fetching Bayern stats:', error);
    return null;
  }
}
