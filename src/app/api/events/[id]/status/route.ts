import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and authorized (e.g., admin or event creator)
    // For now, we'll allow any authenticated user to update status for demonstration.
    // In a real application, you would add more granular authorization checks here.
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be signed in to update event status" },
        { status: 401 }
      );
    }

    const { id } = params; // Get event ID from URL parameters
    const { status, statusReason, postponedUntil } = await request.json();

    const validStatuses = ["upcoming", "active", "completed", "cancelled", "postponed"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value provided." },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        status: status,
        statusReason: statusReason,
        postponedUntil: status === "postponed" && postponedUntil ? new Date(postponedUntil) : null,
        statusUpdatedBy: session.user.id, // Use the ID of the user who updated the status
        statusUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error updating event status:", error);
    return NextResponse.json(
      { message: "Failed to update event status", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 