import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

    const { eventId, userId, testimonial, rating, locationClear, orgRating, volunteerImpactFelt, wouldAttendAgain, suggestions } = body;

    // 1. Validate input
    if (!eventId || !userId || !testimonial || rating === undefined) {
      return NextResponse.json({ message: 'Missing required fields: eventId, userId, testimonial, rating' }, { status: 400 });
    }

    // Validate rating range
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    // Validate other optional fields if provided
    if (locationClear !== undefined && typeof locationClear !== 'boolean') {
      return NextResponse.json({ message: 'locationClear must be a boolean.' }, { status: 400 });
    }
    if (orgRating !== undefined && (typeof orgRating !== 'number' || orgRating < 1 || orgRating > 5)) {
      return NextResponse.json({ message: 'orgRating must be between 1 and 5.' }, { status: 400 });
    }
    if (volunteerImpactFelt !== undefined && (typeof volunteerImpactFelt !== 'number' || volunteerImpactFelt < 1 || volunteerImpactFelt > 5)) {
      return NextResponse.json({ message: 'volunteerImpactFelt must be between 1 and 5.' }, { status: 400 });
    }
    if (wouldAttendAgain !== undefined && typeof wouldAttendAgain !== 'boolean') {
      return NextResponse.json({ message: 'wouldAttendAgain must be a boolean.' }, { status: 400 });
    }
    if (suggestions !== undefined && typeof suggestions !== 'string') {
      return NextResponse.json({ message: 'suggestions must be a string.' }, { status: 400 });
    }

    // 2. Check if event is over
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const eventEndDate = event.endDate || event.startDate; // Use endDate if available, otherwise startDate
    if (new Date() < eventEndDate) {
      return NextResponse.json({ message: 'Cannot submit feedback for an ongoing or future event.' }, { status: 403 });
    }

    // 3. Check if user participated in the event OR is the event creator
    const participant = await prisma.participant.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
    });

    const isCreator = event.creatorId === userId;

    if (!participant && !isCreator) {
      return NextResponse.json({ message: 'User did not participate in this event, nor are they the creator.' }, { status: 403 });
    }

    // 2. Get the drive completion record
    const driveCompletion = await prisma.driveCompletion.findUnique({
      where: { eventId }
    });

    if (!driveCompletion) {
      // If no drive completion exists, create one
      const newDriveCompletion = await prisma.driveCompletion.create({
        data: {
          eventId,
          userId,
          summary: "Initial summary", // You might want to update this later
          images: [],
          highlights: [],
          testimonials: [{
            userId,
            testimonial,
            rating,
            locationClear,
            orgRating,
            volunteerImpactFelt,
            wouldAttendAgain,
            suggestions,
            submittedAt: new Date()
          }],
          keywords: []
        }
      });
      return NextResponse.json({ message: 'Feedback submitted successfully!' }, { status: 200 });
    }

    // 3. Update the drive completion with the new testimonial
    const updatedDriveCompletion = await prisma.driveCompletion.update({
      where: { eventId },
      data: {
        testimonials: {
          push: [{
            userId,
            testimonial,
            rating,
            locationClear,
            orgRating,
            volunteerImpactFelt,
            wouldAttendAgain,
            suggestions,
            submittedAt: new Date()
          }]
        }
      }
    });

    // Fetch the updated record to verify the testimonial was added
    const verifiedDriveCompletion = await prisma.driveCompletion.findUnique({
      where: { eventId }
    });

    console.log('Updated DriveCompletion:', JSON.stringify(verifiedDriveCompletion, null, 2));

    return NextResponse.json({ 
      message: 'Feedback submitted successfully!',
      driveCompletion: verifiedDriveCompletion 
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error submitting feedback:', JSON.stringify(error, null, 2));

    let errorMessage = 'Unknown error occurred';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message;
    }

    return NextResponse.json(
      { 
        message: 'Internal server error', 
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
} 