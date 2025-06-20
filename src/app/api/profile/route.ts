import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        age: true,
        gender: true,
        city: true,
        phone: true,
        id: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Drives participated in
    const participated = await prisma.participant.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            eventName: true,
            startDate: true,
            endDate: true,
            location: true,
            driveCompletion: {
              select: {
                testimonials: true,
              },
            },
          },
        },
      },
    });
    const participatedDrives = participated.map((p) => ({
      id: p.event.id,
      eventName: p.event.eventName,
      startDate: p.event.startDate,
      endDate: p.event.endDate,
      location: p.event.location,
      driveCompletion: p.event.driveCompletion,
    }));
    // Drives created
    const createdDrivesRaw = await prisma.event.findMany({
      where: { creatorId: user.id },
      select: {
        id: true,
        eventName: true,
        startDate: true,
        endDate: true,
        location: true,
        driveCompletion: {
          select: {
            testimonials: true,
          },
        },
      },
    });
    const createdDrives = createdDrivesRaw.map((e) => ({
      id: e.id,
      eventName: e.eventName,
      startDate: e.startDate,
      endDate: e.endDate,
      location: e.location,
      driveCompletion: e.driveCompletion,
    }));
    return NextResponse.json({
      user,
      participatedDrives,
      createdDrives,
    });
  } catch (error: any) {
    console.error("Error in /api/profile:", error);
    return NextResponse.json({ error: "Failed to load profile", details: error.message || "Unknown error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 