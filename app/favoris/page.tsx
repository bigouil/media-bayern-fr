"use client";

import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import articlesData from "@/lib/data/articles.json";
import Link from "next/link";
import { Calendar, Clock, Bookmark } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function FavorisPage() {
  const { bookmarks, mounted } = useBookmarks();

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const bookmarkedArticles = articlesData.filter(article =>
    bookmarks.includes(article.id)
  );

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mes articles favoris
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {bookmarkedArticles.length === 0
              ? "Vous n'avez pas encore de favoris"
              : `${bookmarkedArticles.length} article${bookmarkedArticles.length > 1 ? "s" : ""} enregistré${bookmarkedArticles.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </ScrollReveal>

      {bookmarkedArticles.length === 0 ? (
        <ScrollReveal delay={0.2}>
          <div className="text-center py-16">
            <Bookmark className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Commencez à enregistrer vos articles préférés pour les retrouver facilement ici.
            </p>
            <Link
              href="/actualites"
              className="inline-block px-6 py-3 bg-[#E21C2A] text-white rounded-lg hover:bg-[#C0182A] transition-colors"
            >
              Découvrir les articles
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarkedArticles.map((article, index) => (
            <ScrollReveal key={article.id} delay={index * 0.1}>
              <Link
                href={`/article/${article.slug}`}
                className="group block bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800"
              >
                <div className="aspect-video bg-gradient-to-br from-[#E21C2A] to-[#2C2C2C] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold opacity-20">
                      {article.title.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.date).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime} min
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#E21C2A] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
