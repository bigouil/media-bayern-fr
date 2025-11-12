export const metadata = {
  title: "Recherche",
  description: "Rechercher sur Media Bayern",
};

export default function RecherchePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Recherche</h1>

      <div className="mb-8">
        <input
          type="search"
          placeholder="Rechercher des articles, mercato, matchs..."
          className="w-full px-6 py-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21C2A] dark:bg-gray-900 dark:border-gray-700"
        />
      </div>

      <div className="text-center py-12 text-gray-500">
        <p>Tapez votre recherche ci-dessus pour trouver des articles.</p>
        <p className="text-sm mt-2">
          Vous pouvez également utiliser Cmd+K (Mac) ou Ctrl+K (Windows) pour ouvrir la recherche
          rapide.
        </p>
      </div>
    </div>
  );
}
