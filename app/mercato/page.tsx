import Link from "next/link";
import mercatoData from "@/lib/data/mercato.json";
import articlesData from "@/lib/data/articles.json";

export const metadata = {
  title: "Mercato",
  description: "Toutes les rumeurs et transferts du FC Bayern Munich",
};

export default function MercatoPage() {
  const mercatoArticles = articlesData.filter((a) => a.category === "mercato");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mercato Bayern Munich</h1>

      {/* Rumeurs et transferts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Rumeurs et transferts en cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mercatoData.map((transfer) => (
            <div
              key={transfer.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{transfer.playerName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transfer.currentClub} • {transfer.position}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    transfer.status === "avancé"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : transfer.status === "négociation"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {transfer.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {transfer.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span
                  className={`font-semibold ${
                    transfer.transferType === "incoming"
                      ? "text-green-600 dark:text-green-400"
                      : transfer.transferType === "outgoing"
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {transfer.transferType === "incoming"
                    ? "→ Arrivée"
                    : transfer.transferType === "outgoing"
                    ? "← Départ"
                    : "✍️ Prolongation"}
                </span>
                {transfer.fee && (
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {transfer.fee}
                  </span>
                )}
              </div>
              {transfer.probability && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E21C2A]"
                      style={{ width: `${transfer.probability}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Probabilité : {transfer.probability}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Articles mercato */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Articles mercato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mercatoArticles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  [Image]
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-[#E21C2A] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  {new Date(article.date).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
