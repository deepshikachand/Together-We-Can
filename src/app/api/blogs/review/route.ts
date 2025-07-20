import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const { blogId, reviewed } = await req.json();
    
    if (!blogId || typeof reviewed !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { 
        reviewed,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        },
        event: {
          select: {
            id: true,
            eventName: true,
          }
        },
      }
    });

    return NextResponse.json({ 
      message: `Blog ${reviewed ? 'marked as reviewed' : 'marked as unreviewed'}`,
      blog: updatedBlog 
    });
  } catch (error: any) {
    console.error('Blog review update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update blog review status',
      details: error.message 
    }, { status: 500 });
  }
} 