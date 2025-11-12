import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache 1 minute

/**
 * GET /api/articles
 * Récupère la liste des articles avec filtres
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: articles par page (défaut: 10)
 * - category: slug de catégorie
 * - tag: slug de tag
 * - featured: articles en vedette (true/false)
 * - search: recherche dans titre/excerpt
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorySlug = searchParams.get('category');
    const tagSlug = searchParams.get('tag');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const publishedFilter = searchParams.get('published');

    // Construction de la requête avec filtres
    const where: Prisma.ArticleWhereInput = {};

    if (includeDrafts) {
      if (publishedFilter === 'true') {
        where.published = true;
      } else if (publishedFilter === 'false') {
        where.published = false;
      }
    } else {
      where.published = true;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = {
        some: {
          tag: { slug: tagSlug },
        },
      };
    }

    if (featured) {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    // Récupérer les articles avec pagination
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    // Formater les articles
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      author: article.author,
      published: article.published,
      publishedAt: article.publishedAt,
      views: article.views,
      featured: article.featured,
      category: article.category ? {
        name: article.category.name,
        slug: article.category.slug,
        color: article.category.color,
      } : null,
      tags: article.tags.map((at) => ({
        name: at.tag.name,
        slug: at.tag.slug,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles
 * Créer un nouvel article (admin uniquement)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      categorySlug,
      tags,
      published = false,
      featured = false,
    } = body;

    const isPublished = Boolean(published);
    const shouldFeature = isPublished ? true : Boolean(featured);

    // Validation basique
    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article with this slug already exists' },
        { status: 409 }
      );
    }

    // Récupérer la catégorie
    let categoryId = null;
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      categoryId = category?.id;
    }

    // Créer l'article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || content.slice(0, 200),
        content,
        coverImage,
        author: author || 'Rédaction Media Bayern',
        published: isPublished,
        featured: shouldFeature,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    // Associer les tags
    if (tags && Array.isArray(tags)) {
      for (const tagSlug of tags) {
        const tag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });

        if (tag) {
          await prisma.articleTag.create({
            data: {
              articleId: article.id,
              tagId: tag.id,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create article',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
