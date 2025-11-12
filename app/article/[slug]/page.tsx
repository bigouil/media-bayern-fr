import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ApiTag {
  name: string;
  slug?: string;
}

type HeadersList = Awaited<ReturnType<typeof headers>>;

async function fetchArticle(slug: string, baseUrl: string) {
  const apiUrl = new URL(`/api/articles/${slug}`, baseUrl);
  const response = await fetch(apiUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.success ? payload.data : null;
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const baseUrl = resolveBaseUrl(requestHeaders);
  const article = await fetchArticle(slug, baseUrl);

  if (!article) {
    return {
      title: "Article introuvable | Media Bayern",
    };
  }

  const url = new URL(`/article/${article.slug}`, baseUrl);

  return {
    title: `${article.title} | Media Bayern`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: url.toString(),
      type: "article",
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const baseUrl = resolveBaseUrl(requestHeaders);
  const article = await fetchArticle(slug, baseUrl);

  if (!article) {
    notFound();
  }

  const tags = (article.tags || []).map((tag: string | ApiTag, index: number) =>
    typeof tag === "string"
      ? { name: tag, slug: `${tag}-${index}` }
      : { name: tag.name, slug: tag.slug ?? `${tag.name}-${index}` }
  );

  const content = typeof article.content === "string" ? article.content : "";
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag: { name: string; slug: string }) => (
            <span
              key={tag.slug}
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-medium"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          <span>
            {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span>
            {typeof article.author === "string"
              ? article.author
              : article.author?.name ?? "Rédaction Media Bayern"}
          </span>
          {article.category && (
            <>
              <span>•</span>
              <span>{article.category.name}</span>
            </>
          )}
        </div>
      </header>

      {article.coverImage && (
        <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {article.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="space-y-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {paragraphs.length > 0
            ? paragraphs.map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)
            : article.content}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link
          href="/actualites"
          className="inline-flex items-center text-[#E21C2A] hover:underline"
        >
          ← Retour aux actualités
        </Link>
      </div>
    </article>
  );
}
