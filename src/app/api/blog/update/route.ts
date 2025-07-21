import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function PUT(req: NextRequest) {
  const { eventId, title, content } = await req.json();
  if (!eventId || !title || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const blog = await prisma.blog.findFirst({ where: { eventId } });
  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
  const updated = await prisma.blog.update({
    where: { id: blog.id },
    data: { title, content, reviewed: true },
  });
  return NextResponse.json({ blog: updated });
} 