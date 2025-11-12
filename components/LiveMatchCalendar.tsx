"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, RefreshCw } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  competition: string;
  stadium: string;
  status: "finished" | "scheduled" | "live";
  isLive?: boolean;
  leagueLogo?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

const competitions = ["Tous", "Bundesliga", "Ligue des Champions", "DFB-Pokal"];

export function LiveMatchCalendar() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState("Tous");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Charger les matchs depuis l'API
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches?type=all&season=2024');
      const data = await response.json();

      if (data.success) {
        setMatches(data.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch matches');
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les matchs au montage
  useEffect(() => {
    fetchMatches();
  }, []);

  // Actualiser automatiquement toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Filtrer par compétition
  const filteredMatches = useMemo(() => {
    if (selectedCompetition === "Tous") return matches;
    return matches.filter((m) => m.competition.includes(selectedCompetition));
  }, [matches, selectedCompetition]);

  // Grouper par mois
  const matchesByMonth = useMemo(() => {
    const groups: { [key: string]: Match[] } = {};
    filteredMatches.forEach((match) => {
      const date = new Date(match.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(match);
    });
    return groups;
  }, [filteredMatches]);

  const sortedMonths = Object.keys(matchesByMonth).sort();

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E21C2A]" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des matchs...</p>
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
        <button
          onClick={fetchMatches}
          className="px-4 py-2 bg-[#E21C2A] text-white rounded-lg hover:bg-[#C0182A] transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres et actualisation */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {competitions.map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompetition(comp)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCompetition === comp
                  ? "bg-[#E21C2A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {comp}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Mis à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Liste des matchs */}
      <div className="space-y-8">
        {sortedMonths.map((monthKey) => {
          const [year, month] = monthKey.split("-");
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
            "fr-FR",
            { month: "long", year: "numeric" }
          );

          return (
            <div key={monthKey}>
              <h3 className="text-2xl font-bold mb-4 capitalize">{monthName}</h3>
              <div className="space-y-4">
                {matchesByMonth[monthKey]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((match, index) => (
                    <MatchCard key={match.id} match={match} index={index} />
                  ))}
              </div>
            </div>
          );
        })}

        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun match trouvé pour cette compétition.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  const matchDate = new Date(match.date);
  const isBayernHome = match.homeTeam.includes("Bayern") || match.homeTeam.includes("Munich");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white dark:bg-gray-900 rounded-xl p-6 border ${
        match.isLive
          ? 'border-[#E21C2A] shadow-lg shadow-[#E21C2A]/20'
          : 'border-gray-200 dark:border-gray-800'
      } hover:shadow-lg transition-all`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Date et compétition */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{matchDate.getDate()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {matchDate.toLocaleDateString("fr-FR", { month: "short" })}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">{match.competition}</div>
              {match.isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#E21C2A] text-white text-xs font-bold rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">{match.stadium}</div>
          </div>
        </div>

        {/* Match */}
        <div className="flex-1 flex items-center justify-center gap-6">
          <div className="text-right flex-1">
            <div className={`font-semibold ${isBayernHome ? "text-[#E21C2A]" : ""}`}>
              {match.homeTeam}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {match.status === "finished" || match.isLive ? (
              <>
                <div className="text-2xl font-bold">{match.homeScore}</div>
                <div className="text-gray-400">-</div>
                <div className="text-2xl font-bold">{match.awayScore}</div>
              </>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {matchDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>

          <div className="text-left flex-1">
            <div className={`font-semibold ${!isBayernHome ? "text-[#E21C2A]" : ""}`}>
              {match.awayTeam}
            </div>
          </div>
        </div>

        {/* Statut */}
        <div>
          {match.isLive ? (
            <span className="px-3 py-1 bg-[#E21C2A] text-white rounded-full text-sm font-bold">
              En direct
            </span>
          ) : match.status === "finished" ? (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              Terminé
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              À venir
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
