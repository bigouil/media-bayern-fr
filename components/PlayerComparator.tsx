"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import playersData from "@/lib/data/players.json";

const localPlayers = playersData as Player[];

type Player = (typeof playersData)[number];

type MetricDescriptor = {
  id: string;
  label: string;
  format?: (value: number) => string;
  getValue: (player: Player) => number;
};

const numberFormatter = (value: number, fractionDigits = 2) =>
  value % 1 === 0 ? value.toString() : value.toFixed(fractionDigits);

const comparisonMetrics: MetricDescriptor[] = [
  {
    id: "goals",
    label: "Buts",
    getValue: (player) => player.performance.goals,
  },
  {
    id: "assists",
    label: "Passes décisives",
    getValue: (player) => player.performance.assists,
  },
  {
    id: "goalContrib",
    label: "Buts + passes",
    getValue: (player) => player.performance.goalContrib,
  },
  {
    id: "goals90",
    label: "Buts / 90",
    getValue: (player) => player.per90.goals,
    format: (value) => numberFormatter(value, 2),
  },
  {
    id: "assists90",
    label: "Passes / 90",
    getValue: (player) => player.per90.assists,
    format: (value) => numberFormatter(value, 2),
  },
  {
    id: "xg",
    label: "xG",
    getValue: (player) => player.expected.xg,
  },
  {
    id: "xag",
    label: "xAG",
    getValue: (player) => player.expected.xag,
  },
  {
    id: "xg90",
    label: "xG + xAG / 90",
    getValue: (player) => player.per90.xgPlusXag,
    format: (value) => numberFormatter(value, 2),
  },
  {
    id: "progressivePasses",
    label: "Passes progressives",
    getValue: (player) => player.progression.progressivePasses,
  },
  {
    id: "progressiveCarries",
    label: "Courses progressives",
    getValue: (player) => player.progression.progressiveCarries,
  },
];

const insightMetrics: MetricDescriptor[] = [
  {
    id: "goals90",
    label: "Buts / 90",
    getValue: (player) => player.per90.goals,
    format: (value) => numberFormatter(value, 2),
  },
  {
    id: "assists90",
    label: "Passes / 90",
    getValue: (player) => player.per90.assists,
    format: (value) => numberFormatter(value, 2),
  },
  {
    id: "xContribution",
    label: "xG + xAG / 90",
    getValue: (player) => player.per90.xgPlusXag,
    format: (value) => numberFormatter(value, 2),
  },
];

export function PlayerComparator() {
  const [players, setPlayers] = useState<Player[]>(localPlayers);
  const [player1, setPlayer1] = useState<Player | null>(localPlayers[0] ?? null);
  const [player2, setPlayer2] = useState<Player | null>(localPlayers[1] ?? null);
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/players/stats");
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data)) {
          const data = payload.data as Player[];
          if (mounted) {
            setPlayers(data);
            setPlayer1((current) => findMatchingPlayer(current, data) ?? data[0] ?? null);
            setPlayer2((current) => findMatchingPlayer(current, data) ?? data[1] ?? null);
            setError(null);
          }
        } else {
          throw new Error("Réponse invalide");
        }
      } catch (err) {
        console.error("Impossible de charger les stats", err);
        if (mounted) {
          setPlayers(localPlayers);
          setPlayer1(localPlayers[0] ?? null);
          setPlayer2(localPlayers[1] ?? null);
          setError("Échec du chargement live. Affichage des données locales.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlayers();
    return () => {
      mounted = false;
    };
  }, [refreshIndex]);

  const positions = useMemo(() => {
    const set = new Set<string>();
    players.forEach((player) => {
      player.position.split(",").forEach((pos) => {
        const cleaned = pos.trim();
        if (cleaned) set.add(cleaned);
      });
    });
    return Array.from(set).sort();
  }, [players]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesPosition =
        positionFilter === "all" ||
        player.position
          .split(",")
          .map((pos) => pos.trim().toLowerCase())
          .includes(positionFilter.toLowerCase());
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLowerCase().includes(normalizedSearch) ||
        player.nation.toLowerCase().includes(normalizedSearch);
      return matchesPosition && matchesSearch;
    });
  }, [players, positionFilter, normalizedSearch]);

  const selectorPlayers = (selected: Player | null, exclude?: string) => {
    const pool = filteredPlayers.length > 0 ? filteredPlayers : players;
    const list = pool.filter((player) => player.id !== exclude);
    if (selected && !list.find((player) => player.id === selected.id)) {
      return [selected, ...list];
    }
    return list;
  };

  const hasFilters = positionFilter !== "all" || normalizedSearch.length > 0;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Source</p>
            <p className="text-sm font-semibold">Stats officielles Bundesliga 2025-2026</p>
          </div>
          <div className="flex items-center gap-3">
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setPositionFilter("all");
                setRefreshIndex((value) => value + 1);
              }}
              disabled={loading}
              className="text-xs text-gray-500 underline hover:text-[#E21C2A] disabled:opacity-50"
            >
              {loading ? "Chargement..." : "Actualiser"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Filtres</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Limitez la liste pour trouver rapidement vos profils
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher un joueur ou une nation..."
              className="w-full md:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
            />
            <button
              onClick={() => {
                setPositionFilter("all");
                setSearchTerm("");
              }}
              className="text-sm font-medium text-[#E21C2A] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={positionFilter === "all"}
            label="Tous les postes"
            onClick={() => setPositionFilter("all")}
          />
          {positions.map((position) => (
            <FilterChip
              key={position}
              active={positionFilter.toLowerCase() === position.toLowerCase()}
              label={position}
              onClick={() => setPositionFilter(position)}
            />
          ))}
        </div>
        {filteredPlayers.length === 0 && hasFilters && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun joueur ne correspond à ces critères. Ajustez les filtres pour afficher d&apos;autres profils.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <PlayerSelector
          label="Joueur 1"
          players={selectorPlayers(player1, player2?.id)}
          selectedPlayer={player1}
          excludeId={player2?.id}
          onSelect={setPlayer1}
        />
        <div className="flex items-center justify-center gap-3 py-2 md:flex-col md:py-0">
          <button
            type="button"
            onClick={() => {
              if (player1 && player2) {
                setPlayer1(player2);
                setPlayer2(player1);
              }
            }}
            disabled={!player1 || !player2}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium disabled:opacity-50"
          >
            ↔︎ Inverser
          </button>
          <button
            type="button"
            onClick={() => {
              setPlayer1(players[0] ?? null);
              setPlayer2(players[1] ?? null);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium"
          >
            Réinitialiser
          </button>
        </div>
        <PlayerSelector
          label="Joueur 2"
          players={selectorPlayers(player2, player1?.id)}
          selectedPlayer={player2}
          excludeId={player1?.id}
          onSelect={setPlayer2}
        />
      </div>

      {player1 && player2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <ComparisonInsights player1={player1} player2={player2} />

          <div className="grid md:grid-cols-2 gap-6">
            <PlayerCard player={player1} />
            <PlayerCard player={player2} />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-6">Statistiques comparées</h3>
            <div className="space-y-4">
              {comparisonMetrics.map((metric) => (
                <StatComparison
                  key={metric.id}
                  label={metric.label}
                  value1={metric.getValue(player1)}
                  value2={metric.getValue(player2)}
                  player1Name={player1.name}
                  player2Name={player2.name}
                  formatter={metric.format}
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-6">Vue saison 2025-2026</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <SeasonStats player={player1} />
              <SeasonStats player={player2} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PlayerSelector({
  label,
  players,
  selectedPlayer,
  excludeId,
  onSelect,
}: {
  label: string;
  players: Player[];
  selectedPlayer: Player | null;
  excludeId?: string;
  onSelect: (player: Player) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={selectedPlayer?.id || ""}
        onChange={(event) => {
          const player = players.find((p) => p.id === event.target.value);
          if (player) onSelect(player);
        }}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
      >
        <option value="">Sélectionner un joueur</option>
        {players
          .filter((p) => p.id !== excludeId)
          .map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} · {player.position}
            </option>
          ))}
      </select>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="bg-gradient-to-br from-[#E21C2A] to-[#C0182A] text-white rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold">{player.name}</h3>
          <p className="opacity-90">
            {player.position} · {player.nation}
          </p>
        </div>
        <div className="text-lg font-semibold opacity-80">{player.age} ans</div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <CardStat label="Matchs" value={player.metrics.matches} />
        <CardStat label="Titularisations" value={player.metrics.starts} />
        <CardStat label="Minutes" value={player.metrics.minutes} />
        <CardStat label="Buts" value={player.performance.goals} />
        <CardStat label="Passes" value={player.performance.assists} />
        <CardStat label="xG + xAG" value={numberFormatter(player.expected.npxgPlusXag, 2)} />
      </div>
    </div>
  );
}

function CardStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatComparison({
  label,
  value1,
  value2,
  player1Name,
  player2Name,
  formatter,
}: {
  label: string;
  value1: number;
  value2: number;
  player1Name: string;
  player2Name: string;
  formatter?: (value: number) => string;
}) {
  const maxValue = Math.max(value1, value2, 1);
  const percentage1 = maxValue === 0 ? 0 : (value1 / maxValue) * 100;
  const percentage2 = maxValue === 0 ? 0 : (value2 / maxValue) * 100;
  const difference = value1 - value2;

  const display = (value: number) => {
    if (formatter) return formatter(value);
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-400">
        <span>{label}</span>
        <div className="flex gap-4">
          <span className={value1 > value2 ? "font-bold text-[#E21C2A]" : ""}>{display(value1)}</span>
          <span className={value2 > value1 ? "font-bold text-[#E21C2A]" : ""}>{display(value2)}</span>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage1}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-3 rounded-l bg-blue-500 dark:bg-blue-600"
          title={`${player1Name}: ${display(value1)}`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage2}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-3 rounded-r bg-[#E21C2A]"
          title={`${player2Name}: ${display(value2)}`}
        />
        <span className="text-xs font-semibold text-gray-500 w-14 text-right">
          {difference > 0 ? `+${display(difference)}` : display(difference)}
        </span>
      </div>
    </div>
  );
}

function SeasonStats({ player }: { player: Player }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">{player.name}</h4>
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Matchs" value={player.metrics.matches} />
        <StatItem label="Titularisations" value={player.metrics.starts} />
        <StatItem label="Minutes" value={player.metrics.minutes} />
        <StatItem label="Buts" value={player.performance.goals} />
        <StatItem label="Passes" value={player.performance.assists} />
        <StatItem label="xG" value={numberFormatter(player.expected.xg, 2)} />
        <StatItem label="xAG" value={numberFormatter(player.expected.xag, 2)} />
        <StatItem label="Buts/90" value={numberFormatter(player.per90.goals, 2)} />
        <StatItem label="Passes/90" value={numberFormatter(player.per90.assists, 2)} />
        <StatItem label="xG+xAG/90" value={numberFormatter(player.per90.xgPlusXag, 2)} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? "border-[#E21C2A] bg-[#E21C2A] text-white"
          : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function ComparisonInsights({ player1, player2 }: { player1: Player; player2: Player }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <p className="text-sm uppercase tracking-wide text-gray-500">Production totale</p>
        <div className="mt-3 text-3xl font-bold">
          {player1.performance.goalContrib} – {player2.performance.goalContrib}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Buts + passes (toutes compétitions Bundesliga)</p>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:col-span-2">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-3">Indicateurs par 90</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {insightMetrics.map((metric) => {
            const value1 = metric.getValue(player1);
            const value2 = metric.getValue(player2);
            const leader =
              value1 === value2 ? null : value1 > value2 ? player1.name : player2.name;
            const format = metric.format ?? ((value: number) => numberFormatter(value, 2));
            return (
              <div key={metric.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {metric.label}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-semibold">
                    {leader ?? "Égalité"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(value1)} vs {format(value2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function findMatchingPlayer(current: Player | null, list: Player[]): Player | null {
  if (!current) return null;
  return (
    list.find((player) => player.id === current.id) ??
    list.find((player) => player.name.toLowerCase() === current.name.toLowerCase()) ??
    null
  );
}
