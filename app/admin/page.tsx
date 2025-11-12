"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  published: boolean;
  featured: boolean;
  views: number;
  category: {
    name: string;
    slug: string;
    color: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const response = await fetch('/api/articles?limit=100&includeDrafts=true');
      const data = await response.json();

      if (data.success) {
        const allArticles = data.data;
        setArticles(allArticles);

        // Calculer les stats
        setStats({
          total: allArticles.length,
          published: allArticles.filter((a: Article) => a.published).length,
          drafts: allArticles.filter((a: Article) => !a.published).length,
        });
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(slug: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Erreur lors de la mise à jour');
    }
  }

  async function toggleFeatured(slug: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentStatus }),
      });

      if (response.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Erreur lors de la mise à jour');
    }
  }

  async function deleteArticle(slug: string, title: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Erreur lors de la suppression');
    }
  }

  async function logout() {
    await fetch('/api/auth/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  const filteredArticles = articles.filter((article) => {
    if (filter === 'published') return article.published;
    if (filter === 'draft') return !article.published;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
              <Image
                src="/logo.jpg"
                alt="Logo Media Bayern"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold">Administration</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/new"
              className="px-4 py-2 bg-bayern-red text-white rounded hover:bg-bayern-red/90"
            >
              + Nouvel article
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Se déconnecter
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retour au site
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-2xl font-bold text-bayern-red">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total articles</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Publiés</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600">{stats.drafts}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Brouillons</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-bayern-red text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded ${
              filter === 'published'
                ? 'bg-bayern-red text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Publiés ({stats.published})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded ${
              filter === 'draft'
                ? 'bg-bayern-red text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Brouillons ({stats.drafts})
          </button>
        </div>
      </div>

      {/* Liste des articles */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-bayern-red"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            Aucun article pour le moment
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Synchronisez les flux RSS pour importer des articles :
          </p>
          <code className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded">
            npm run rss:sync
          </code>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Article</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Catégorie</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Vues</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {article.featured && (
                        <span className="text-yellow-500" title="En vedette">⭐</span>
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">{article.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{article.excerpt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {article.category && (
                      <span
                        className="text-xs px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: article.category.color }}
                      >
                        {article.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{article.views}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        article.published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {article.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleFeatured(article.slug, article.featured)}
                        className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title={article.featured ? 'Retirer de la une' : 'Mettre à la une'}
                      >
                        {article.featured ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={() => togglePublish(article.slug, article.published)}
                        className={`text-xs px-3 py-1 rounded ${
                          article.published
                            ? 'bg-gray-200 dark:bg-gray-700'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {article.published ? 'Dépublier' : 'Publier'}
                      </button>
                      <Link
                        href={`/admin/edit/${article.slug}`}
                        className="text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/article/${article.slug}`}
                        target="_blank"
                        className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.slug, article.title)}
                        className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold mb-2">📋 Instructions rapides</h3>
        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li>• <strong>+ Nouvel article</strong> : Formulaire complet (texte, miniature, publication)</li>
          <li>• <strong>Sync RSS</strong> : Importer automatiquement les dernières actualités</li>
          <li>• <strong>⭐ Étoile</strong> : Mettre l&apos;article en vedette sur la homepage</li>
          <li>• <strong>Publier/Dépublier</strong> : Contrôler la visibilité publique</li>
          <li>• <strong>Voir</strong> : Prévisualiser l&apos;article sur le site</li>
          <li>• <strong>Supprimer</strong> : Supprimer définitivement l&apos;article</li>
        </ul>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
          ⚠️ Note : Ce panneau d&apos;administration est protégé par les comptes définis dans <code>ADMIN_USERS</code>.
          Ajoutez autant de rédacteurs que nécessaire via votre fichier <code>.env</code>.
        </p>
      </div>
    </div>
  );
}
