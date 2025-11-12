import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache 5 minutes

/**
 * GET /api/categories
 * Récupère toutes les catégories avec le nombre d'articles
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: { published: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      articlesCount: category._count.articles,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
