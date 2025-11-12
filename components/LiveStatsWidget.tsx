"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Users, Award } from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

const INITIAL_STATS: Stat[] = [
  { label: "Position", value: 1, suffix: "er", icon: Award, color: "text-yellow-500" },
  { label: "Points", value: 27, icon: Target, color: "text-[#E21C2A]" },
  { label: "Buts marqués", value: 36, icon: TrendingUp, color: "text-green-500" },
  { label: "Joueurs utilisés", value: 23, icon: Users, color: "text-blue-500" },
];

export function LiveStatsWidget() {
  const [stats, setStats] = useState<Stat[]>(INITIAL_STATS);
  const formEntries = useMemo(() => ["V", "V", "V", "D", "V"], []);

  // Simule des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((previous) =>
        previous.map((stat) => {
          if (stat.label === "Points") {
            const shouldUpdate = Math.random() > 0.8;
            return shouldUpdate ? { ...stat, value: stat.value + 1 } : stat;
          }
          if (stat.label === "Buts marqués") {
            const shouldUpdate = Math.random() > 0.9;
            return shouldUpdate ? { ...stat, value: stat.value + 1 } : stat;
          }
          return stat;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Statistiques saison 2024-2025</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">En direct</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <motion.span
                key={stat.value}
                initial={{ scale: 1.2, color: "#E21C2A" }}
                animate={{ scale: 1, color: "inherit" }}
                className="text-3xl font-bold"
              >
                {stat.value}
              </motion.span>
              {stat.suffix && (
                <span className="text-sm text-gray-600 dark:text-gray-400">{stat.suffix}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Série en cours</span>
          <div className="flex gap-1">
            {formEntries.map((result, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  result === "V"
                    ? "bg-green-500 text-white"
                    : result === "D"
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
