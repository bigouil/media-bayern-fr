// Service d'agrégation RSS pour les actualités Bayern Munich
// Récupère automatiquement les actualités depuis plusieurs sources fiables

import Parser from 'rss-parser';
import TurndownService from 'turndown';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

type ParserItem = Parser.Item & {
  enclosure?: Parser.Enclosure | { url?: string };
  mediaContent?: { $?: { url?: string } };
  contentEncoded?: string;
  content?: string;
  description?: string;
};

export interface RSSArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  categoryName: string;
}

// Sources RSS fiables pour le Bayern Munich
export const RSS_SOURCES = [
  {
    name: 'FC Bayern Official',
    url: 'https://fcbayern.com/de/news.rss',
    category: 'Officiel',
    enabled: true,
  },
  {
    name: 'Bundesliga News',
    url: 'https://www.bundesliga.com/en/bundesliga/news.rss',
    category: 'Bundesliga',
    enabled: true,
  },
  {
    name: 'Kicker Bayern',
    url: 'https://newsfeed.kicker.de/news/fcbayern',
    category: 'Actualités',
    enabled: true,
  },
  {
    name: 'Sky Sports Bayern',
    url: 'https://www.skysports.com/rss/12040',
    category: 'Actualités',
    enabled: true,
  },
  {
    name: 'ESPN Bayern',
    url: 'https://www.espn.com/espn/rss/soccer/news',
    category: 'International',
    enabled: true,
  },
];

/**
 * Récupère les articles depuis un flux RSS
 */
export async function fetchRSSFeed(feedUrl: string, sourceName: string, category: string): Promise<RSSArticle[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const articles: RSSArticle[] = [];

    for (const item of feed.items as ParserItem[]) {
      if (!item.title || !item.link) continue;

      // Extraire l'image de couverture
      let coverImage: string | undefined;
      if (item.enclosure?.url) {
        coverImage = item.enclosure.url;
      } else if (item.mediaContent?.$?.url) {
        coverImage = item.mediaContent.$.url;
      } else if (item.content) {
        // Chercher une image dans le contenu
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          coverImage = imgMatch[1];
        }
      }

      // Extraire le contenu
      const rawContent = item.contentEncoded || item.content || item.description || '';
      const content = turndownService.turndown(rawContent);

      // Extraire l'excerpt
      const excerpt = item.contentSnippet || item.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '';

      // Générer un slug
      const slug = item.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      articles.push({
        title: item.title,
        slug: `${slug}-${Date.now()}`,
        excerpt: excerpt.slice(0, 200),
        content,
        coverImage,
        author: item.creator || sourceName,
        source: sourceName,
        sourceUrl: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        categoryName: category,
      });
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Récupère les articles depuis toutes les sources RSS actives
 */
export async function fetchAllRSSFeeds(): Promise<RSSArticle[]> {
  const allArticles: RSSArticle[] = [];

  for (const source of RSS_SOURCES) {
    if (!source.enabled) continue;

    console.log(`📡 Fetching ${source.name}...`);
    const articles = await fetchRSSFeed(source.url, source.name, source.category);
    allArticles.push(...articles);
    console.log(`✅ ${articles.length} articles from ${source.name}`);
  }

  // Trier par date de publication (plus récent en premier)
  return allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

/**
 * Filtre les articles Bayern Munich
 * (Utile si les flux RSS contiennent d'autres équipes)
 */
export function filterBayernArticles(articles: RSSArticle[]): RSSArticle[] {
  const bayernKeywords = [
    'bayern',
    'munich',
    'fcb',
    'fc bayern',
    'bavière',
    'allianz arena',
  ];

  return articles.filter((article) => {
    const searchText = `${article.title} ${article.excerpt} ${article.content}`.toLowerCase();
    return bayernKeywords.some((keyword) => searchText.includes(keyword));
  });
}

/**
 * Nettoie le contenu HTML et convertit en Markdown
 */
export function cleanHTML(html: string): string {
  return turndownService.turndown(html);
}

/**
 * Extrait la première image d'un contenu HTML
 */
export function extractFirstImage(html: string): string | null {
  const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

/**
 * Génère un slug unique pour un article
 */
export function generateSlug(title: string, timestamp?: number): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return timestamp ? `${baseSlug}-${timestamp}` : baseSlug;
}
