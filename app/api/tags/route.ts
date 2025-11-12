import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache 5 minutes

/**
 * GET /api/tags
 * Récupère tous les tags avec le nombre d'articles
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      articlesCount: tag._count.articles,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTags,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
