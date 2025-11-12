import { NextResponse } from "next/server";
import articlesData from "@/lib/data/articles.json";
import configData from "@/lib/data/config.json";

export async function GET() {
  const baseUrl = configData.url;
  const buildDate = new Date().toUTCString();

  const rssItems = articlesData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)
    .map((article) => {
      const articleUrl = `${baseUrl}/article/${article.slug}`;
      const pubDate = new Date(article.date).toUTCString();

      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${article.author.name}</author>
      <category>${article.category}</category>
      ${article.coverImage ? `<enclosure url="${baseUrl}${article.coverImage}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${configData.name}</title>
    <link>${baseUrl}</link>
    <description>${configData.description}</description>
    <language>fr-FR</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.jpg</url>
      <title>${configData.name}</title>
      <link>${baseUrl}</link>
    </image>
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
