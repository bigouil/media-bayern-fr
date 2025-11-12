import { MetadataRoute } from "next";
import articlesData from "@/lib/data/articles.json";
import configData from "@/lib/data/config.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = configData.url;

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/actualites`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mercato`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/matchs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comps`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recherche`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Pages articles dynamiques
  const articlePages: MetadataRoute.Sitemap = articlesData.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "weekly" as const,
    priority: article.featured ? 0.9 : 0.7,
  }));

  return [...staticPages, ...articlePages];
}
