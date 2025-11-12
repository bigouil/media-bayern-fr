#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Importer les articles statiques (lib/data/articles.json) dans la base Prisma
 * Usage: node scripts/import-legacy-articles.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ARTICLES_PATH = path.join(__dirname, '../lib/data/articles.json');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function titleCase(value) {
  return value
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function ensureCategory(slug, label) {
  if (!slug) return null;
  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: {
      name: titleCase(label ?? slug),
      slug,
      color: '#E21C2A',
    },
  });
  return category.id;
}

async function ensureTag(tagName) {
  if (!tagName) return null;
  const slug = slugify(tagName);
  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: {
      name: tagName,
      slug,
    },
  });
  return tag.id;
}

async function linkTags(articleId, tagNames) {
  await prisma.articleTag.deleteMany({ where: { articleId } });

  for (const name of tagNames) {
    const tagId = await ensureTag(name);
    if (!tagId) continue;
    await prisma.articleTag.create({
      data: {
        articleId,
        tagId,
      },
    });
  }
}

async function importArticles() {
  if (!fs.existsSync(ARTICLES_PATH)) {
    throw new Error(`Impossible de trouver ${ARTICLES_PATH}`);
  }

  const raw = fs.readFileSync(ARTICLES_PATH, 'utf-8');
  const articles = JSON.parse(raw);

  console.log(`🗞️  Import de ${articles.length} articles statiques...`);

  for (const article of articles) {
    const slug = article.slug;
    const author =
      typeof article.author === 'string'
        ? article.author
        : article.author?.name ?? 'Rédaction Media Bayern';
    const content =
      article.content ??
      `${article.excerpt}\n\n*Contenu importé automatiquement depuis lib/data/articles.json*`;
    const publishedAt = article.date ? new Date(article.date) : undefined;

    const categorySlug = article.category ? slugify(article.category) : null;
    const categoryId = await ensureCategory(categorySlug, article.category);

    const baseData = {
      title: article.title,
      excerpt: article.excerpt,
      content,
      coverImage: article.coverImage,
      author,
      published: true,
      featured: Boolean(article.featured),
      categoryId,
    };

    if (publishedAt) {
      baseData.publishedAt = publishedAt;
    }

    const dbArticle = await prisma.article.upsert({
      where: { slug },
      update: baseData,
      create: {
        slug,
        ...baseData,
      },
    });

    if (Array.isArray(article.tags) && article.tags.length > 0) {
      await linkTags(
        dbArticle.id,
        article.tags.map((tag) => (typeof tag === 'string' ? tag : `${tag}`))
      );
    }

    console.log(`   ✅ ${article.title}`);
  }

  console.log('\n✨ Import terminé. Les articles sont désormais éditables depuis /admin.');
}

importArticles()
  .catch((error) => {
    console.error('❌ Erreur lors de l’import des articles statiques:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
