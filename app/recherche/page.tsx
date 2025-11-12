import Link from "next/link";
import { headers } from "next/headers";
import { Search } from "lucide-react";

interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  author: string;
  publishedAt?: string;
  featured: boolean;
}

type HeadersList = Awaited<ReturnType<typeof headers>>;

function resolveBaseUrl(requestHeaders: HeadersList) {
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (host) {
    return `${protocol}://${host}`;
  }

  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envSiteUrl) {
    return envSiteUrl;
  }

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

async function searchArticles(baseUrl: string, query: string) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = new URL("/api/articles", baseUrl);
  url.searchParams.set("limit", "100");
  url.searchParams.set("includeDrafts", "true");
  url.searchParams.set("search", query.trim());

  const response = await fetch(url.toString(), {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return (payload.data || []) as ArticleSummary[];
}

export const metadata = {
  title: "Recherche",
  description: "Rechercher des articles, matchs et contenus Media Bayern",
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const requestHeaders = await headers();
  const baseUrl = resolveBaseUrl(requestHeaders);
  const query = searchParams?.q?.toString().trim() ?? "";
  const results = await searchArticles(baseUrl, query);

  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Recherche</h1>

      <form className="mb-8" action="/recherche" method="GET">
        <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          Tapez un mot-clé (joueur, compétition, adversaire…)
        </label>
        <div className="flex gap-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Ex : Allianz Arena, Champions League, Musiala..."
            className="flex-1 px-6 py-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21C2A] dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-[#E21C2A] text-white font-semibold rounded-lg hover:bg-[#C0182A] transition"
          >
            Rechercher
          </button>
        </div>
      </form>

      {query.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Tapez votre recherche ci-dessus pour trouver des articles.</p>
          <p className="text-sm mt-2">
            Vous pouvez également utiliser Cmd+K (Mac) ou Ctrl+K (Windows) pour ouvrir la recherche rapide.
          </p>
        </div>
      )}

      {query.length > 0 && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun résultat pour <span className="font-semibold">&ldquo;{query}&rdquo;</span>.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            {results.length} résultat{results.length > 1 ? "s" : ""} pour &ldquo;{query}&rdquo;
          </p>
          {results.map((article) => (
            <article
              key={article.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-800"
            >
              <Link href={`/article/${article.slug}`} className="group block">
                <p className="text-xs text-gray-500 mb-2">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Récemment"}
                </p>
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-[#E21C2A] transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">{article.excerpt}</p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
