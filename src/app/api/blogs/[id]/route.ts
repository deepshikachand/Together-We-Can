import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function GET(
  request: NextRequest
) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Missing blog ID' }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            eventName: true,
            startDate: true,
            location: true,
            currentParticipants: true,
            categories: {
              select: {
                categoryName: true,
              },
            },
            city: {
              select: {
                cityName: true,
                state: true,
              },
            },
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Blog by-id error:', error);
    let message = 'Internal server error';
    let stack = undefined;
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    }
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
} 