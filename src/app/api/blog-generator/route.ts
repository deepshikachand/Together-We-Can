import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildBlogPrompt } from '@/lib/buildBlogPrompt';

const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL = 'gemini-1.5-flash-latest';

function getSummary(text: string) {
  // Simple summary: first 2 sentences
  const match = text.match(/([^.!?]*[.!?]){1,2}/);
  return match ? match[0].trim() : text.slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Fetch event and drive completion data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { creator: true },
    });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const driveCompletion = await prisma.driveCompletion.findUnique({
      where: { eventId },
    });
    if (!driveCompletion) {
      return NextResponse.json({ error: 'DriveCompletion not found' }, { status: 404 });
    }

    // Check if a blog already exists for this event
    const existingBlog = await prisma.blog.findFirst({ where: { eventId } });
    if (existingBlog) {
      return NextResponse.json({
        message: 'Blog already exists for this event.',
        alreadyExists: true,
        blogId: existingBlog.id,
      });
    }

    // Build the prompt
    const prompt = buildBlogPrompt({
      ...event,
      fullAddress: event.fullAddress ?? undefined,
      startDate: event.startDate ? event.startDate.toISOString() : undefined,
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
    }, driveCompletion);

    // Call Gemini API via REST
    if (!API_KEY) {
      return NextResponse.json({ error: 'Google API key not set' }, { status: 500 });
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      return NextResponse.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }
    const apiData = await apiResponse.json();
    const generatedContent = apiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedContent) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    // Prepare Blog fields
    const summary = getSummary(generatedContent);
    const keywords = driveCompletion.keywords || [];
    const highlights = driveCompletion.highlights || [];
    const testimonials = driveCompletion.testimonials || [];
    const title = event.eventName || 'Community Drive Blog';

    // Save the blog to the database
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content: generatedContent,
        summary,
        keywords,
        highlights,
        testimonials,
        aiGenerated: true,
        reviewed: false,
        author: { connect: { id: event.creatorId } },
        event: { connect: { id: eventId } },
      },
    });

    return NextResponse.json({
      message: 'Blog generated and saved.',
      alreadyExists: false,
      blogId: newBlog.id,
    });
  } catch (error: any) {
    console.error('Blog generation error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
} 