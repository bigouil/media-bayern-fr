#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// Script de synchronisation RSS
// Récupère automatiquement les dernières actualités depuis les flux RSS
// Usage: npm run rss:sync

const { PrismaClient } = require('@prisma/client');
const Parser = require('rss-parser');
const TurndownService = require('turndown');

const prisma = new PrismaClient();
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});
const turndownService = new TurndownService();

// Sources RSS
const RSS_SOURCES = [
  {
    name: 'FC Bayern Official',
    url: 'https://fcbayern.com/de/news.rss',
    category: 'Officiel',
  },
  {
    name: 'Bundesliga News',
    url: 'https://www.bundesliga.com/en/bundesliga/news.rss',
    category: 'Bundesliga',
  },
  {
    name: 'Sky Sports Bayern',
    url: 'https://www.skysports.com/rss/12040',
    category: 'Actualités',
  },
];

const BAYERN_KEYWORDS = ['bayern', 'munich', 'fcb', 'fc bayern'];

function isBayernArticle(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  return BAYERN_KEYWORDS.some(keyword => text.includes(keyword));
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function extractImage(item) {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }
  const content = item.contentEncoded || item.content || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

async function syncRSSFeed(source) {
  console.log(`\n📡 Syncing ${source.name}...`);

  try {
    const feed = await parser.parseURL(source.url);
    let imported = 0;
    let skipped = 0;

    // Vérifier ou créer la catégorie
    let category = await prisma.category.findUnique({
      where: { slug: source.category.toLowerCase() },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: source.category,
          slug: source.category.toLowerCase(),
          description: `Articles de ${source.name}`,
        },
      });
    }

    for (const item of feed.items) {
      if (!item.title || !item.link) continue;

      // Filtrer uniquement les articles Bayern
      const content = item.contentEncoded || item.content || item.description || '';
      if (!isBayernArticle(item.title, content)) {
        continue;
      }

      const slug = generateSlug(item.title);

      // Vérifier si l'article existe déjà
      const existing = await prisma.article.findUnique({
        where: { slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Extraire et nettoyer le contenu
      const rawContent = item.contentEncoded || item.content || item.description || '';
      const markdownContent = turndownService.turndown(rawContent);
      const excerpt = (item.contentSnippet || item.description || '')
        .replace(/<[^>]*>/g, '')
        .slice(0, 200);

      // Créer l'article
      await prisma.article.create({
        data: {
          title: item.title,
          slug,
          excerpt,
          content: markdownContent,
          coverImage: extractImage(item),
          author: item.creator || source.name,
          source: source.name,
          sourceUrl: item.link,
          published: true,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          categoryId: category.id,
        },
      });

      imported++;
    }

    console.log(`✅ ${source.name}: ${imported} nouveaux articles importés, ${skipped} existants ignorés`);

    // Mettre à jour le feed RSS
    await prisma.rSSFeed.upsert({
      where: { url: source.url },
      update: { lastFetch: new Date() },
      create: {
        name: source.name,
        url: source.url,
        lastFetch: new Date(),
      },
    });

  } catch (error) {
    console.error(`❌ Error syncing ${source.name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting RSS synchronization...\n');
  console.log(`📅 ${new Date().toLocaleString('fr-FR')}\n`);

  for (const source of RSS_SOURCES) {
    await syncRSSFeed(source);
  }

  // Statistiques finales
  const totalArticles = await prisma.article.count();
  const publishedArticles = await prisma.article.count({
    where: { published: true },
  });

  console.log('\n📊 Statistiques:');
  console.log(`   Total articles: ${totalArticles}`);
  console.log(`   Publiés: ${publishedArticles}`);
  console.log('\n✨ Synchronisation terminée!\n');
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
