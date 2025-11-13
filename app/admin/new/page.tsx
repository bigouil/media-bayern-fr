"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminNewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [author, setAuthor] = useState("Rédaction Media Bayern");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const payload = await response.json();
        if (payload.success) {
          setCategories(payload.data);
        }
      } catch (err) {
        console.error("Impossible de charger les catégories", err);
      }
    };
    fetchCategories();
  }, []);

  const isFormValid = useMemo(() => {
    return title.trim().length > 0 && slug.trim().length > 0 && content.trim().length > 0;
  }, [title, slug, content]);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function handleThumbnailUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setThumbnailUploading(true);
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléversement");
    } finally {
      setThumbnailUploading(false);
    }
  }

  function handlePublishToggle(checked: boolean) {
    setPublished(checked);
    if (checked) {
      setFeatured(true);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => slugify(tag));

      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          coverImage,
          author: author.trim(),
          categorySlug: category || null,
          tags: tagsArray,
          published,
          featured,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error || "Impossible de créer l'article");
      }

      setSuccessMessage("Article créé avec succès !");
      setTimeout(() => router.push("/admin"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Nouvel article</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rédigez, ajoutez une miniature et publiez en quelques clics.
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
              placeholder="Ex: Le Bayern domine le Klassiker"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
              placeholder="le-bayern-domine-le-klassiker"
              required
            />
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
            placeholder="Écrivez votre article en Markdown ou HTML léger..."
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
            <label className="block text-sm font-medium">Date de publication</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21C2A]"
            />

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
              <span>Publier immédiatement</span>
            </label>
            <p className="text-xs text-gray-500">
              Tout article publié est automatiquement mis en avant sur l&apos;accueil.
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

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#E21C2A] text-white font-semibold hover:bg-[#C0182A] transition disabled:opacity-50"
        >
          {loading ? "Publication..." : "Créer l'article"}
        </button>
      </form>
    </div>
  );
}
