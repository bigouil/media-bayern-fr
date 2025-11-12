"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LiveMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  competition: string;
}

export function LiveMatchWidget() {
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Simule un match en direct
  useEffect(() => {
    // Vérifier s'il y a un match en cours
    // Dans une vraie app, vous interrogeriez une API
    const checkLiveMatch = () => {
      const now = new Date();
      const hour = now.getHours();

      // Simule un match en direct entre 15h et 17h
      if (hour >= 15 && hour < 17) {
        setIsLive(true);
        setMatch({
          homeTeam: "Bayern Munich",
          awayTeam: "VfB Stuttgart",
          homeScore: 2,
          awayScore: 1,
          minute: 67,
          competition: "Bundesliga"
        });
      } else {
        setIsLive(false);
        setMatch(null);
      }
    };

    checkLiveMatch();
    const interval = setInterval(checkLiveMatch, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (!isLive || !match) {
    return null; // Ne pas afficher le widget s'il n'y a pas de match en direct
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#E21C2A] to-[#C0182A] text-white rounded-xl shadow-lg p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-bold uppercase tracking-wider">En direct</span>
        </div>
        <span className="text-sm opacity-90">{match.competition}</span>
      </div>

      <div className="space-y-4">
        {/* Équipe domicile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              FCB
            </div>
            <span className="font-semibold text-lg">{match.homeTeam}</span>
          </div>
          <motion.span
            key={match.homeScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold"
          >
            {match.homeScore}
          </motion.span>
        </div>

        {/* Séparateur avec minute */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px bg-white/30 flex-1"></div>
          <span className="text-2xl font-bold">{match.minute}&apos;</span>
          <div className="h-px bg-white/30 flex-1"></div>
        </div>

        {/* Équipe extérieur */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              VFB
            </div>
            <span className="font-semibold text-lg">{match.awayTeam}</span>
          </div>
          <motion.span
            key={match.awayScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold"
          >
            {match.awayScore}
          </motion.span>
        </div>
      </div>

      <Link
        href="/matchs"
        className="mt-6 block text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
      >
        Voir les détails du match →
      </Link>
    </motion.div>
  );
}
