import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
          include: {
            categories: {
              select: {
                id: true,
                categoryName: true,
              },
            },
            city: {
              select: {
                id: true,
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

    // Transform the data to match the expected frontend format
    const transformedBlog = {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      category: blog.event?.categories?.[0]
        ? {
            id: blog.event.categories[0].id,
            name: blog.event.categories[0].categoryName,
          }
        : { id: '1', name: 'General' },
      city: blog.event?.city
        ? {
            id: blog.event.city.id,
            name: blog.event.city.cityName,
            state: blog.event.city.state,
          }
        : { id: '1', name: 'Unknown', state: 'Unknown' },
      author: {
        id: blog.author.id,
        name: blog.author.name,
      },
      event: blog.event
        ? {
            id: blog.event.id,
            eventName: blog.event.eventName,
            participants: blog.event.currentParticipants,
            date: blog.event.startDate.toISOString(), // Use startDate
            time: blog.event.time,
            location: blog.event.fullAddress || blog.event.location, // Prefer fullAddress
          }
        : undefined,
      media: [{
        id: 'default',
        mediaUrl: '/images/hero-1.jpg'
      }], // Use the default image as requested
      createdAt: blog.createdAt.toISOString(),
      viewCount: blog.ratingAverage ? Math.round(blog.ratingAverage * 20) : 0,
    };

    return NextResponse.json(transformedBlog);
  } catch (error: any) {
    console.error(`Error fetching blog with id:`, error);
    return NextResponse.json(
      { message: 'Error fetching blog', details: error.message },
      { status: 500 }
    );
  }
} 