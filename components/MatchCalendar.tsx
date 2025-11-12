"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import matchesData from "@/lib/data/matches.json";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  competition: string;
  stadium: string;
  status: "finished" | "scheduled";
  scorers?: Array<{
    player: string;
    minute: number;
    team: "home" | "away";
  }>;
}

const competitions = ["Tous", "Bundesliga", "Ligue des Champions", "DFB-Pokal"];

export function MatchCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCompetition, setSelectedCompetition] = useState("Tous");
  const [viewMode, setViewMode] = useState<"month" | "list">("list");

  const matches = matchesData as Match[];

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

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
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

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-[#E21C2A] text-white"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`p-2 rounded-lg ${
              viewMode === "month"
                ? "bg-[#E21C2A] text-white"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Liste des matchs */}
      {viewMode === "list" && (
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
        </div>
      )}

      {/* Vue calendrier */}
      {viewMode === "month" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold">
              {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </h3>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <MonthView matches={filteredMatches} currentDate={currentDate} />
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  const matchDate = new Date(match.date);
  const isBayernHome = match.homeTeam === "Bayern Munich";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
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
            <div className="text-sm text-gray-600 dark:text-gray-400">{match.competition}</div>
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
            {match.status === "finished" ? (
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
          {match.status === "finished" ? (
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

function MonthView({ matches, currentDate }: { matches: Match[]; currentDate: Date }) {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i);
  }

  const matchesByDay: { [key: number]: Match[] } = {};
  matches.forEach((match) => {
    const date = new Date(match.date);
    if (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    ) {
      const day = date.getDate();
      if (!matchesByDay[day]) matchesByDay[day] = [];
      matchesByDay[day].push(match);
    }
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`aspect-square p-2 rounded-lg ${
              day ? "bg-gray-50 dark:bg-gray-800" : ""
            } ${matchesByDay[day!] ? "bg-[#E21C2A]/10 border-2 border-[#E21C2A]" : ""}`}
          >
            {day && (
              <div>
                <div className="text-sm font-semibold">{day}</div>
                {matchesByDay[day] && (
                  <div className="mt-1">
                    {matchesByDay[day].map((match) => (
                      <div
                        key={match.id}
                        className="w-2 h-2 rounded-full bg-[#E21C2A] mb-1"
                        title={`${match.homeTeam} vs ${match.awayTeam}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
