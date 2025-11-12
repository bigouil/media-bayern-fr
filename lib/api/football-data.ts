// Configuration Football-Data.org API
// Site: https://www.football-data.org/
// Plan gratuit : 10 requêtes/minute (très généreux !)

const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN || '';
const API_BASE_URL = 'https://api.football-data.org/v4';
const BAYERN_TEAM_ID = 5; // ID du Bayern Munich sur Football-Data.org

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string; // "FINISHED", "SCHEDULED", "IN_PLAY", etc.
  matchday: number;
  stage: string;
  homeTeam: {
    id: number;
    name: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    crest: string;
  };
  score: {
    winner: string | null;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
  competition: {
    id: number;
    name: string;
    emblem: string;
  };
  venue: string;
}

interface ApiResponse {
  matches: ApiMatch[];
}

async function fetchFromAPI(endpoint: string) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'X-Auth-Token': API_TOKEN,
    },
    next: {
      revalidate: 300, // Cache pour 5 minutes
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Football-Data API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getBayernMatches(season?: string) {
  try {
    const currentYear = new Date().getFullYear();
    const currentSeason = season || currentYear.toString();

    const data: ApiResponse = await fetchFromAPI(
      `/teams/${BAYERN_TEAM_ID}/matches?season=${currentSeason}`
    );

    return data.matches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching Bayern matches:', error);
    return [];
  }
}

export async function getLiveMatches() {
  try {
    // Football-Data.org n'a pas de paramètre spécifique pour "live"
    // On récupère les matchs en cours via le statut IN_PLAY
    const data: ApiResponse = await fetchFromAPI(
      `/teams/${BAYERN_TEAM_ID}/matches?status=IN_PLAY`
    );

    return data.matches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

export async function getUpcomingMatches(limit: number = 5) {
  try {
    const data: ApiResponse = await fetchFromAPI(
      `/teams/${BAYERN_TEAM_ID}/matches?status=SCHEDULED`
    );

    // Trier par date et prendre les N premiers
    const sortedMatches = data.matches
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
      .slice(0, limit);

    return sortedMatches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}

export async function getRecentMatches(limit: number = 5) {
  try {
    const data: ApiResponse = await fetchFromAPI(
      `/teams/${BAYERN_TEAM_ID}/matches?status=FINISHED`
    );

    // Trier par date décroissante et prendre les N premiers
    const sortedMatches = data.matches
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
      .slice(0, limit);

    return sortedMatches.map(transformMatch);
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

export async function getMatchById(matchId: number) {
  try {
    const data = await fetchFromAPI(`/matches/${matchId}`);
    return transformMatch(data);
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}

// Transformer les données de l'API vers notre format
function transformMatch(apiMatch: ApiMatch) {
  const isFinished = apiMatch.status === 'FINISHED';
  const isLive = apiMatch.status === 'IN_PLAY';

  return {
    id: `match-${apiMatch.id}`,
    homeTeam: apiMatch.homeTeam.name,
    awayTeam: apiMatch.awayTeam.name,
    homeScore: isFinished || isLive ? apiMatch.score.fullTime.home : null,
    awayScore: isFinished || isLive ? apiMatch.score.fullTime.away : null,
    date: apiMatch.utcDate,
    competition: apiMatch.competition.name,
    stadium: apiMatch.venue || 'Stade non spécifié',
    status: isFinished ? 'finished' : isLive ? 'live' : 'scheduled',
    isLive,
    leagueLogo: apiMatch.competition.emblem,
    homeTeamLogo: apiMatch.homeTeam.crest,
    awayTeamLogo: apiMatch.awayTeam.crest,
    matchday: apiMatch.matchday,
  };
}

// Fonction pour récupérer les statistiques de l'équipe
export async function getBayernStats() {
  try {
    const data = await fetchFromAPI(`/teams/${BAYERN_TEAM_ID}`);
    return data;
  } catch (error) {
    console.error('Error fetching Bayern stats:', error);
    return null;
  }
}

// Fonction pour récupérer le classement
export async function getBundesligaStandings() {
  try {
    const BUNDESLIGA_ID = 2002; // Bundesliga sur Football-Data.org
    const data = await fetchFromAPI(`/competitions/${BUNDESLIGA_ID}/standings`);
    return data.standings;
  } catch (error) {
    console.error('Error fetching Bundesliga standings:', error);
    return null;
  }
}
