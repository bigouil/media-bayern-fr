import Link from "next/link";
import { headers } from "next/headers";
import articlesData from "@/lib/data/articles.json";

export const dynamic = "force-dynamic";

type HeadersList = Awaited<ReturnType<typeof headers>>;

interface ArticleCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  publishedAt?: string;
  tags: string[];
  readTime: number;
  featured?: boolean;
}

interface ApiArticle {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string | null;
  publishedAt?: string;
  date?: string;
  tags?: Array<{ name: string; slug?: string } | string>;
  featured?: boolean;
  content?: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function estimateReadTime(text?: string) {
  if (!text) return 2;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function normalizeApiArticle(article: ApiArticle): ArticleCard {
  return {
    id: article.id ?? article.slug,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? "",
    coverImage: article.coverImage,
    publishedAt: article.publishedAt ?? article.date,
    tags: (article.tags ?? []).map((tag) =>
      typeof tag === "string" ? tag : tag?.name ?? "FC Bayern"
    ),
    readTime: estimateReadTime(article.content ?? article.excerpt),
    featured: article.featured,
  };
}

function normalizeLocalArticle(article: (typeof articlesData)[number]): ArticleCard {
  const publishedAt = article.date ?? new Date().toISOString();
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    publishedAt,
    tags: (article.tags ?? []).map((tag) => (typeof tag === "string" ? tag : `${tag}`)),
    readTime: article.readTime ?? estimateReadTime(article.excerpt),
    featured: article.featured,
  };
}

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

async function fetchArticles(baseUrl: string, params: { featured?: boolean; limit: number }) {
  try {
    const url = new URL("/api/articles", baseUrl);
    url.searchParams.set("limit", params.limit.toString());
    if (params.featured) {
      url.searchParams.set("featured", "true");
    }
    const response = await fetch(url.toString(), {
      next: { revalidate: params.featured ? 60 : 120 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }

    const payload = await response.json();
    return (payload.data ?? []).map(normalizeApiArticle);
  } catch (error) {
    console.error("Error fetching homepage articles:", error);
    return null;
  }
}

function ArticleImage({ src, title }: { src?: string | null; title: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
        <span className="text-4xl">📰</span>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
      style={{ backgroundImage: `url(${src})` }}
      role="img"
      aria-label={title}
    />
  );
}

export default async function HomePage() {
  const requestHeaders = await headers();
  const baseUrl = resolveBaseUrl(requestHeaders);

  const fallbackArticles = articlesData.map(normalizeLocalArticle);
  const fallbackFeatured = fallbackArticles.filter((article) => article.featured).slice(0, 3);

  const [featuredData, recentData] = await Promise.all([
    fetchArticles(baseUrl, { featured: true, limit: 3 }),
    fetchArticles(baseUrl, { limit: 6 }),
  ]);

  const featuredArticles = featuredData && featuredData.length > 0 ? featuredData : fallbackFeatured;
  const recentArticles =
    recentData && recentData.length > 0
      ? recentData
      : fallbackArticles.slice(0, 6).map((article) => ({ ...article, readTime: article.readTime }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16 text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Bienvenue sur <span style={{ color: "#E21C2A" }}>Media Bayern</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Toute l&apos;actualité du FC Bayern Munich : articles, mercato, matchs et compétitions
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/actualites"
            className="inline-block px-8 py-4 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: "#E21C2A", color: "white" }}
          >
            Dernières actualités
          </Link>
          <Link
            href="/matchs"
            className="inline-block px-8 py-4 border-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Voir les matchs
          </Link>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">À la une</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <Link
                key={`${article.id}-${article.slug}`}
                href={`/article/${article.slug}`}
                className="group block border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                  <ArticleImage src={article.coverImage} title={article.title} />
                  <div
                    className="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded"
                    style={{ backgroundColor: "#E21C2A" }}
                  >
                    À LA UNE
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#E21C2A] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("fr-FR")
                      : "Récemment"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Derniers articles</h2>
          <Link href="/actualites" className="text-[#E21C2A] hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentArticles.map((article) => (
            <Link
              key={`${article.id}-${article.slug}`}
              href={`/article/${article.slug}`}
              className="group block border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                <ArticleImage src={article.coverImage} title={article.title} />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span
                      key={`${article.slug}-${slugify(tag)}`}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-[#E21C2A] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("fr-FR")
                      : "Récemment"}
                  </span>
                  {!!article.readTime && <span>{article.readTime} min</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
