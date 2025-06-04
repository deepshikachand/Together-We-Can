import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const eventId = context.params.id;
    const userId = session.user.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Check if user is already a participant
    const existingParticipant = event.participants.find(
      (p) => p.userId === userId
    );

    if (existingParticipant) {
      return NextResponse.json(
        { message: "Already joined this event" },
        { status: 400 }
      );
    }

    // Check if event is full
    if (event.currentParticipants >= event.expectedParticipants) {
      return NextResponse.json(
        { message: "Event is full" },
        { status: 400 }
      );
    }

    // Add participant and update currentParticipants count
    const [participant] = await prisma.$transaction([
      prisma.participant.create({
        data: {
          eventId,
          userId,
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Error joining event:", error);
    return NextResponse.json(
      { message: "Error joining event" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 