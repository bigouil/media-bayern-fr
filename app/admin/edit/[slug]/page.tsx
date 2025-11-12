"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ApiArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  author: string;
  category?: { slug: string } | null;
  tags?: Array<{ name: string }>;
  published?: boolean;
  featured?: boolean;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminEditArticlePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const routeSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [originalSlug, setOriginalSlug] = useState(routeSlug ?? "");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [author, setAuthor] = useState("Rédaction Media Bayern");
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingArticle, setLoadingArticle] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setOriginalSlug(routeSlug ?? "");
  }, [routeSlug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const payload = await response.json();
        if (payload.success) {
          setCategories(payload.data);
        }
      } catch (error) {
        console.error("Impossible de charger les catégories", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!routeSlug) {
      return;
    }
    let ignore = false;

    const loadArticle = async () => {
      try {
        setLoadingArticle(true);
        setPageError(null);
        const response = await fetch(`/api/articles/${routeSlug}`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload?.error || "Impossible de charger l'article");
        }

        if (ignore) return;

        const article: ApiArticle = payload.data;
        setTitle(article.title ?? "");
        setSlug(article.slug ?? "");
        setOriginalSlug(article.slug ?? routeSlug);
        setExcerpt(article.excerpt ?? "");
        setContent(article.content ?? "");
        setCoverImage(article.coverImage ?? null);
        setCategory(article.category?.slug ?? "");
        setTags((article.tags ?? []).map((tag) => tag.name).join(", "));
        setPublished(Boolean(article.published));
        setFeatured(Boolean(article.featured));
        setAuthor(typeof article.author === "string" ? article.author : "Rédaction Media Bayern");
      } catch (error) {
        console.error("Erreur lors du chargement de l'article:", error);
        setPageError(
          error instanceof Error ? error.message : "Impossible de charger cet article."
        );
      } finally {
        if (!ignore) {
          setLoadingArticle(false);
        }
      }
    };

    loadArticle();

    return () => {
      ignore = true;
    };
  }, [routeSlug]);

  const isFormValid = useMemo(() => {
    return title.trim().length > 0 && slug.trim().length > 0 && content.trim().length > 0;
  }, [title, slug, content]);

  function handlePublishToggle(checked: boolean) {
    setPublished(checked);
    if (checked) {
      setFeatured(true);
    }
  }

  async function handleThumbnailUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setThumbnailUploading(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error || "Échec du téléversement");
      }

      setCoverImage(payload.path);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erreur lors du téléversement");
    } finally {
      setThumbnailUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isFormValid || !originalSlug) return;

    setSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => slugify(tag));

      const normalizedSlug = slugify(slug.trim());
      setSlug(normalizedSlug);

      const body: Record<string, unknown> = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage,
        author: author.trim(),
        categorySlug: category || null,
        tags: tagsArray,
        published,
        featured,
      };

      if (normalizedSlug && normalizedSlug !== originalSlug) {
        body.newSlug = normalizedSlug;
      }

      const response = await fetch(`/api/articles/${originalSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error || "Impossible de mettre à jour l'article");
      }

      const updated = payload.data;
      setOriginalSlug(updated.slug);
      setSlug(updated.slug);
      setSuccessMessage("Article mis à jour avec succès !");

      if (updated.slug && updated.slug !== routeSlug) {
        router.replace(`/admin/edit/${updated.slug}`);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  if (loadingArticle) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-bayern-red"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de l&apos;article...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Impossible de charger l&apos;article</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{pageError}</p>
        <Link
          href="/admin"
          className="inline-block px-6 py-3 rounded-lg bg-bayern-red text-white hover:bg-bayern-red/90"
        >
          ← Retour au tableau
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Modifier l&apos;article</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ajustez le contenu publié, mettez à jour le slug ou changez la mise en avant.
          </p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
        >
          ← Retour au tableau
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
              placeholder="Titre de l'article"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
              placeholder="slug-de-l-article"
              required
            />
            <p className="text-xs text-gray-500">
              Le slug détermine l&apos;URL : /article/<span className="font-mono">{slug}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Résumé</label>
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
            placeholder="Court résumé affiché dans les listes d'articles"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Contenu</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
            placeholder="Éditez l'article en Markdown ou HTML léger..."
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Miniature</label>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="text-sm"
              />
              {thumbnailUploading && (
                <p className="text-xs text-gray-500">Téléversement en cours...</p>
              )}
              {coverImage && (
                <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Miniature" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Auteur</label>
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
            />

            <label className="block text-sm font-medium">Catégorie</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
            >
              <option value="">Aucune</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
              placeholder="ex: ligue des champions, kane"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => handlePublishToggle(event.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[#E21C2A] focus:ring-[#E21C2A]"
              />
              <span>Article publié</span>
            </label>
            <p className="text-xs text-gray-500">
              Les articles publiés apparaissent publiquement. Ils sont automatiquement mis en avant.
            </p>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-[#E21C2A] focus:ring-[#E21C2A]"
            />
            <span>Mettre en avant</span>
          </label>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <button
          type="submit"
          disabled={!isFormValid || saving}
          className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#E21C2A] text-white font-semibold hover:bg-[#C0182A] transition disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Mettre à jour l'article"}
        </button>
      </form>
    </div>
  );
}
