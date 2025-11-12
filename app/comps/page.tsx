import competitionsData from "@/lib/data/competitions.json";

type Competition = (typeof competitionsData)[number];

export const metadata = {
  title: "Compétitions",
  description: "Toutes les compétitions du FC Bayern Munich",
};

export default function CompsPage() {
  const competitions = competitionsData as Competition[];
  const activeComps = competitions.filter((comp) => comp.status === "en_cours");
  const pastComps = competitions.filter((comp) => comp.status === "termine");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Compétitions</h1>

      {/* Compétitions en cours */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Saison en cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeComps.map((comp) => {
            const nextMatchAggregate =
              (comp.nextMatch as { aggregateScore?: string } | undefined)?.aggregateScore;

            return (
              <div
                key={comp.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{comp.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Saison {comp.season}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs font-semibold">
                    En cours
                  </span>
                </div>

                {comp.bayernPosition && (
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-[#E21C2A]">
                      {comp.bayernPosition}
                      <span className="text-sm align-super">e</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {comp.bayernPoints} points • {comp.bayernMatches} matchs •{" "}
                      {comp.bayernWins}V {comp.bayernDraws}N {comp.bayernLosses}D
                    </div>
                  </div>
                )}

                {comp.bayernStage && (
                  <div className="mb-4">
                    <div className="text-lg font-semibold">{comp.bayernStage}</div>
                  </div>
                )}

                {comp.nextMatch && (
                  <div className="pt-4 border-t">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      PROCHAIN MATCH
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {comp.nextMatch.home ? "vs" : "@"} {comp.nextMatch.opponent}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(comp.nextMatch.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {nextMatchAggregate && (
                      <div className="mt-2 text-sm font-bold text-[#E21C2A]">
                        Score aller : {nextMatchAggregate}
                      </div>
                    )}
                  </div>
                )}

                {comp.topScorer && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      MEILLEUR BUTEUR
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{comp.topScorer.name}</span>
                      <span className="font-bold text-[#E21C2A]">
                        {comp.topScorer.goals} buts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Compétitions passées */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Saisons précédentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pastComps.map((comp) => {
            const aggregateScore =
              (comp.nextMatch as { aggregateScore?: string } | undefined)?.aggregateScore;

            return (
              <div
                key={comp.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg mb-1">{comp.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Saison {comp.season}
                </p>
                <p className="text-sm font-semibold">{comp.result}</p>
                {comp.topScorer && (
                  <div className="mt-3 pt-3 border-t text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Meilleur buteur : </span>
                    <span className="font-semibold">
                      {comp.topScorer.name} ({comp.topScorer.goals})
                    </span>
                  </div>
                )}
                {aggregateScore && (
                  <div className="mt-2 text-xs font-semibold text-[#E21C2A]">
                    Score aller : {aggregateScore}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
