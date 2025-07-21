import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    const blog = await prisma.blog.findFirst({ where: { eventId } });
    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Blog by-event error:', error);
    let message = 'Internal server error';
    let stack = undefined;
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    }
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
} 