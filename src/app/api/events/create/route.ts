import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      eventName,
      description,
      date, // keep for backward compatibility, but prefer startDate
      startDate,
      time,
      location,
      cityId,
      categoryIds,
      expectedParticipants,
    } = body;

    // Use startDate if provided, otherwise fallback to date
    const eventStartDate = startDate ? new Date(startDate) : new Date(date);

    // Validate required fields
    if (!eventName || !description || !eventStartDate || !time || !location || !cityId || !categoryIds || !expectedParticipants) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        eventName,
        description,
        startDate: eventStartDate,
        time,
        location,
        cityId,
        categoryIds,
        expectedParticipants: parseInt(expectedParticipants),
        currentParticipants: 0,
        creatorId: session.user.id,
        status: "upcoming",
      },
      include: {
        city: true,
        categories: true,
        creator: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Error creating event" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 