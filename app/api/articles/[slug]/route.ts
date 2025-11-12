import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/articles/[slug]
 * Récupère un article spécifique par son slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Incrémenter les vues
    await prisma.article.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    // Formater l'article
    const formattedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      author: article.author,
      source: article.source,
      sourceUrl: article.sourceUrl,
      published: article.published,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      views: article.views + 1, // Inclure la vue actuelle
      featured: article.featured,
      category: article.category ? {
        name: article.category.name,
        slug: article.category.slug,
        color: article.category.color,
        icon: article.category.icon,
      } : null,
      tags: article.tags.map((at) => ({
        name: at.tag.name,
        slug: at.tag.slug,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedArticle,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/articles/[slug]
 * Mettre à jour un article (admin uniquement)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const {
      title,
      newSlug,
      excerpt,
      content,
      coverImage,
      author,
      categorySlug,
      tags,
      published,
      featured,
    } = body;

    // Vérifier si l'article existe
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Récupérer la catégorie
    let categoryId = existingArticle.categoryId;
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      categoryId = category?.id || null;
    }

    const publishedProvided = typeof published === 'boolean';
    const featuredProvided = typeof featured === 'boolean';
    const nextPublished = publishedProvided ? published : existingArticle.published;
    const shouldAutoFeature = !existingArticle.published && nextPublished;
    const nextFeatured = shouldAutoFeature
      ? true
      : featuredProvided
        ? featured
        : existingArticle.featured;

    // Mettre à jour l'article
    const updatedArticle = await prisma.article.update({
      where: { slug },
      data: {
        title: title || existingArticle.title,
        slug: newSlug || existingArticle.slug,
        excerpt: excerpt || existingArticle.excerpt,
        content: content || existingArticle.content,
        coverImage: coverImage !== undefined ? coverImage : existingArticle.coverImage,
        author: author || existingArticle.author,
        published: nextPublished,
        featured: nextFeatured,
        categoryId,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Mettre à jour les tags si fournis
    if (tags && Array.isArray(tags)) {
      // Supprimer les anciens tags
      await prisma.articleTag.deleteMany({
        where: { articleId: updatedArticle.id },
      });

      // Ajouter les nouveaux tags
      for (const tagSlug of tags) {
        const tag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });

        if (tag) {
          await prisma.articleTag.create({
            data: {
              articleId: updatedArticle.id,
              tagId: tag.id,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update article',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles/[slug]
 * Supprimer un article (admin uniquement)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Vérifier si l'article existe
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Supprimer l'article (les tags associés seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.article.delete({
      where: { slug },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete article',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
