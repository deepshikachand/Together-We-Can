import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        city: true,
        categories: true,
        creator: true,
        participants: {
          select: { userId: true }
        },
      },
    });
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    // Ensure city and categories are not null and have the expected field names
    const safeEvent = {
      ...event,
      city: event.city || { cityName: "Unknown", state: "Unknown", country: "Unknown" },
      categories: event.categories || [],
      participants: event.participants || [],
    };
    return NextResponse.json(safeEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ message: "Error fetching event" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 