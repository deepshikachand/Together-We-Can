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
      include: { event: true },
    });
    const participatedDrives = participated.map((p) => ({
      id: p.event.id,
      eventName: p.event.eventName,
      date: p.event.date,
      location: p.event.location,
    }));
    // Drives created
    const createdDrivesRaw = await prisma.event.findMany({
      where: { creatorId: user.id },
    });
    const createdDrives = createdDrivesRaw.map((e) => ({
      id: e.id,
      eventName: e.eventName,
      date: e.date,
      location: e.location,
    }));
    return NextResponse.json({
      user,
      participatedDrives,
      createdDrives,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 