
export const dynamic = "force-dynamic";
import Link from "next/link";
import { headers } from "next/headers";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ScrollReveal } from "@/components/ScrollReveal";

interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string | null;
  articlesCount?: number;
}

interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  author: string;
  publishedAt?: string;
  date?: string;
  views?: number;
  featured: boolean;
  category?: CategorySummary | null;
  tags?: Array<{ name: string; slug: string }>;
}

type LegacyArticle = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  coverImage?: string;
  date?: string;
  author?: string | { name?: string };
  category?: string;
  tags?: Array<string | { name?: string }>;
  featured?: boolean;
  views?: number;
};

export const metadata = {
  title: "Actualités",
  description: "Toutes les actualités du FC Bayern Munich en temps réel",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function getArticles(baseUrl: string) {
  try {
    const url = `${baseUrl}/api/articles?limit=50`;
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache 1 minute
    });

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await response.json();
    return (data.data || []) as ArticleSummary[];
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Fallback vers les données locales en cas d'erreur
    const articlesData = await import('@/lib/data/articles.json');
    const legacyArticles = (articlesData.default ?? []) as LegacyArticle[];
    return legacyArticles.map((article, index: number) => {
      const authorName =
        typeof article.author === "string"
          ? article.author
          : article.author?.name ?? "Rédaction Media Bayern";

      const categoryName = article.category ?? null;
      const categorySlug = categoryName ? slugify(categoryName) : null;

      return {
        id: article.id ?? `legacy-${index}`,
        title: article.title ?? "Article",
        slug: article.slug ?? slugify(`${article.title ?? "article"}-${index}`),
        excerpt: article.excerpt ?? "",
        coverImage: article.coverImage ?? null,
        author: authorName,
        publishedAt: article.date ?? undefined,
        date: article.date ?? undefined,
        views: typeof article.views === "number" ? article.views : 0,
        featured: Boolean(article.featured),
        category: categoryName
          ? {
              id: categorySlug ?? `cat-${index}`,
              name: categoryName,
              slug: categorySlug ?? `cat-${index}`,
              color: "#E21C2A",
              icon: null,
              articlesCount: undefined,
            }
          : null,
        tags: (article.tags ?? []).slice(0, 5).map((tag, tagIndex: number) => {
          const tagName = typeof tag === "string" ? tag : tag?.name ?? `Tag ${tagIndex + 1}`;
          return {
            name: tagName,
            slug: slugify(tagName) || `tag-${tagIndex}`,
          };
        }),
      } satisfies ArticleSummary;
    });
  }
}

// Récupérer les catégories depuis l'API
async function getCategories(baseUrl: string) {
  try {
    const url = `${baseUrl}/api/categories`;
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return (data.data || []) as CategorySummary[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
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

export default async function ActualitesPage() {
  const requestHeaders = await headers();
  const baseUrl = resolveBaseUrl(requestHeaders);

  const [articles, categories] = await Promise.all([
    getArticles(baseUrl),
    getCategories(baseUrl),
  ]);

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Toutes les actualités
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Suivez toute l&apos;actualité du FC Bayern Munich en temps réel
          </p>
        </div>
      </ScrollReveal>

      {/* Filtres par catégories */}
      {categories.length > 0 && (
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Link
              href="/actualites"
              className="px-4 py-2 rounded-full bg-bayern-red text-white font-medium hover:bg-red-700 transition-colors"
            >
              Toutes
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/actualites?category=${category.slug}`}
                className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{ borderColor: category.color }}
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
                {category.articlesCount && category.articlesCount > 0 && (
                  <span className="ml-2 text-xs opacity-60">
                    ({category.articlesCount})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Grille d'articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index: number) => (
          <ScrollReveal key={article.id ?? `${article.slug}-${index}`} delay={0.1 * (index % 6)}>
            <Link
              href={`/article/${article.slug}`}
              className="group block border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                {article.coverImage ? (
                  <OptimizedImage
                    src={article.coverImage}
                    alt={article.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="text-6xl">📰</span>
                  </div>
                )}
                {article.featured && (
                  <div
                    className="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded shadow-lg"
                    style={{ backgroundColor: "#E21C2A" }}
                  >
                    À LA UNE
                  </div>
                )}
                {article.category && (
                  <div
                    className="absolute bottom-3 left-3 px-3 py-1 text-xs font-medium text-white rounded shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: article.category.color + 'CC' }}
                  >
                    {article.category.icon && (
                      <span className="mr-1">{article.category.icon}</span>
                    )}
                    {article.category.name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {article.tags?.slice(0, 2).map((tag: { name: string; slug?: string }) => (
                    <span
                      key={tag.slug ?? `${tag.name}-${article.id}`}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-bayern-red transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>
                      {article.publishedAt || article.date
                        ? new Date(article.publishedAt || article.date!).toLocaleDateString("fr-FR")
                        : "Récemment"}
                    </span>
                    {(article.views ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {article.views}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">
                    {article.author}
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Aucun article disponible pour le moment.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Lancez la synchronisation RSS pour importer des articles :
          </p>
          <code className="mt-4 inline-block px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded">
            npm run rss:sync
          </code>
        </div>
      )}
    </div>
  );
}
