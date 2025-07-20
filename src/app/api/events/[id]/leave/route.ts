import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Extract eventId from the URL path: /api/events/[id]/leave
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    // pathParts: ["", "api", "events", "<id>", "leave"]
    const eventId = pathParts[3];
    const userId = session.user.id;
    const { reason } = await request.json();
    console.log(`User ${userId} is de-enrolling from event ${eventId}. Reason: ${reason}`);

    // Remove participant
    await prisma.participant.deleteMany({ where: { eventId, userId } });

    // Decrement event's currentParticipants
    await prisma.event.update({
      where: { id: eventId },
      data: { currentParticipants: { decrement: 1 } }
    });

    return NextResponse.json({ message: "Successfully left the drive!" });
  } catch (error) {
    return NextResponse.json({ message: "Error leaving drive." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 