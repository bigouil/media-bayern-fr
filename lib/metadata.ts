import { Metadata } from "next";
import { Article } from "./types";
import configData from "./data/config.json";

export function generateArticleMetadata(article: Article): Metadata {
  const baseUrl = configData.url;
  const articleUrl = `${baseUrl}/article/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author.name }],
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url: articleUrl,
      siteName: configData.name,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author.name],
      tags: article.tags,
      images: [
        {
          url: `${baseUrl}${article.coverImage}`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [`${baseUrl}${article.coverImage}`],
      creator: "@fcbayern",
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = ""
): Metadata {
  const baseUrl = configData.url;
  const pageUrl = `${baseUrl}${path}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: pageUrl,
      siteName: configData.name,
      title,
      description,
      images: [
        {
          url: configData.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [configData.ogImage],
      creator: "@fcbayern",
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}
