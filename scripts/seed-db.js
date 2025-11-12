#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// Script de seed pour initialiser la base de données
// Crée les catégories de base, tags, et quelques articles de test
// Usage: npm run db:seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Actualités',
    slug: 'actualites',
    description: 'Les dernières nouvelles du FC Bayern Munich',
    color: '#E21C2A',
    icon: '📰',
  },
  {
    name: 'Matchs',
    slug: 'matchs',
    description: 'Résultats et analyses des matchs',
    color: '#0066B2',
    icon: '⚽',
  },
  {
    name: 'Transferts',
    slug: 'transferts',
    description: 'Mercato et mouvements de joueurs',
    color: '#FDB913',
    icon: '🔄',
  },
  {
    name: 'Joueurs',
    slug: 'joueurs',
    description: 'Focus sur les joueurs du Bayern',
    color: '#E21C2A',
    icon: '👤',
  },
  {
    name: 'Histoire',
    slug: 'histoire',
    description: 'L\'histoire du FC Bayern Munich',
    color: '#2C2C2C',
    icon: '🏆',
  },
  {
    name: 'Officiel',
    slug: 'officiel',
    description: 'Communications officielles du club',
    color: '#E21C2A',
    icon: '📢',
  },
];

const TAGS = [
  { name: 'Bundesliga', slug: 'bundesliga' },
  { name: 'Champions League', slug: 'champions-league' },
  { name: 'DFB-Pokal', slug: 'dfb-pokal' },
  { name: 'Allianz Arena', slug: 'allianz-arena' },
  { name: 'Entraînement', slug: 'entrainement' },
  { name: 'Blessure', slug: 'blessure' },
  { name: 'Record', slug: 'record' },
  { name: 'Interview', slug: 'interview' },
  { name: 'Analyse tactique', slug: 'analyse-tactique' },
];

const SAMPLE_ARTICLES = [
  {
    title: 'Le Bayern Munich remporte son 33e titre de Bundesliga',
    slug: 'bayern-munich-33e-titre-bundesliga',
    excerpt: 'Le FC Bayern Munich a décroché un nouveau titre de champion d\'Allemagne, le 33e de son histoire, après une saison dominée de bout en bout.',
    content: `# Le Bayern Munich remporte son 33e titre de Bundesliga

Le FC Bayern Munich a officiellement remporté son 33e titre de champion d'Allemagne après une victoire décisive lors de la dernière journée de Bundesliga.

## Une saison dominée

Avec 85 points au compteur, le Bayern a une nouvelle fois démontré sa supériorité dans le championnat allemand. L'équipe a su maintenir son niveau de jeu tout au long de la saison, malgré une concurrence accrue.

## Les artisans du succès

- **Harry Kane** : Meilleur buteur du championnat avec 36 buts
- **Joshua Kimmich** : Leader au milieu de terrain
- **Manuel Neuer** : Gardien décisif dans les moments clés

## Réactions

"C'est une fierté immense de remporter ce titre avec ce club légendaire", a déclaré l'entraîneur en conférence de presse.`,
    category: 'actualites',
    tags: ['bundesliga', 'record'],
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200',
    author: 'Rédaction Media Bayern',
    featured: true,
  },
  {
    title: 'Harry Kane franchit la barre des 30 buts en Bundesliga',
    slug: 'harry-kane-30-buts-bundesliga',
    excerpt: 'L\'attaquant anglais continue d\'impressionner avec ses performances exceptionnelles depuis son arrivée au Bayern Munich.',
    content: `# Harry Kane franchit la barre des 30 buts en Bundesliga

Harry Kane a atteint un nouveau jalon dans sa première saison en Bundesliga, franchissant la barre symbolique des 30 buts.

## Un transfert historique réussi

Arrivé en provenance de Tottenham l'été dernier, l'attaquant anglais a rapidement dissipé tous les doutes quant à sa capacité d'adaptation.

## Statistiques impressionnantes

- 30 buts en Bundesliga
- 8 passes décisives
- Meilleur buteur du championnat

Kane pourrait bien battre le record de buts sur une saison en Bundesliga détenu par Robert Lewandowski (41 buts).`,
    category: 'joueurs',
    tags: ['bundesliga', 'record'],
    coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200',
    author: 'Rédaction Media Bayern',
    featured: true,
  },
  {
    title: 'Allianz Arena : Les travaux de modernisation débutent',
    slug: 'allianz-arena-travaux-modernisation',
    excerpt: 'Le stade mythique du Bayern Munich va bénéficier d\'importantes améliorations pour offrir une expérience encore meilleure aux supporters.',
    content: `# Allianz Arena : Les travaux de modernisation débutent

L'Allianz Arena, enceinte légendaire du FC Bayern Munich, va faire l'objet de travaux de modernisation majeurs durant l'intersaison.

## Améliorations prévues

- Nouveaux écrans géants haute définition
- Modernisation des loges VIP
- Amélioration des systèmes de restauration
- Installation de nouvelles technologies d'éclairage LED

## Budget et calendrier

Le projet, d'un montant de 50 millions d'euros, devrait être achevé pour le début de la prochaine saison.`,
    category: 'actualites',
    tags: ['allianz-arena'],
    coverImage: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=1200',
    author: 'Rédaction Media Bayern',
    featured: false,
  },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Créer les catégories
  console.log('📁 Creating categories...');
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`   ✅ ${cat.name}`);
  }

  // Créer les tags
  console.log('\n🏷️  Creating tags...');
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
    console.log(`   ✅ ${tag.name}`);
  }

  // Créer les articles de test
  console.log('\n📝 Creating sample articles...');
  for (const articleData of SAMPLE_ARTICLES) {
    // Récupérer la catégorie
    const category = await prisma.category.findUnique({
      where: { slug: articleData.category },
    });

    // Créer l'article
    const article = await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        coverImage: articleData.coverImage,
        author: articleData.author,
        published: true,
        featured: articleData.featured,
        categoryId: category?.id,
      },
      create: {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        coverImage: articleData.coverImage,
        author: articleData.author,
        published: true,
        featured: articleData.featured,
        categoryId: category?.id,
      },
    });

    // Associer les tags
    for (const tagSlug of articleData.tags) {
      const tag = await prisma.tag.findUnique({
        where: { slug: tagSlug },
      });

      if (tag) {
        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: article.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            articleId: article.id,
            tagId: tag.id,
          },
        });
      }
    }

    console.log(`   ✅ ${articleData.title}`);
  }

  // Créer les sources RSS
  console.log('\n📡 Creating RSS feeds...');
  const rssFeeds = [
    { name: 'FC Bayern Official', url: 'https://fcbayern.com/de/news.rss' },
    { name: 'Bundesliga News', url: 'https://www.bundesliga.com/en/bundesliga/news.rss' },
    { name: 'Sky Sports Bayern', url: 'https://www.skysports.com/rss/12040' },
  ];

  for (const feed of rssFeeds) {
    await prisma.rSSFeed.upsert({
      where: { url: feed.url },
      update: feed,
      create: feed,
    });
    console.log(`   ✅ ${feed.name}`);
  }

  // Statistiques
  const stats = {
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    articles: await prisma.article.count(),
    feeds: await prisma.rSSFeed.count(),
  };

  console.log('\n📊 Database seeded successfully!');
  console.log(`   Categories: ${stats.categories}`);
  console.log(`   Tags: ${stats.tags}`);
  console.log(`   Articles: ${stats.articles}`);
  console.log(`   RSS Feeds: ${stats.feeds}\n`);
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
