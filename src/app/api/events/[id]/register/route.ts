import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "You must be signed in to join a drive." }, { status: 401 });
    }
    const eventId = params.id;
    // Get user from DB
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    // Check if already a participant
    const existing = await prisma.participant.findFirst({ where: { eventId, userId: user.id } });
    if (existing) {
      return NextResponse.json({ message: "You have already joined this drive." }, { status: 400 });
    }
    // Add participant
    await prisma.participant.create({ data: { eventId, userId: user.id } });
    // Increment event's currentParticipants
    await prisma.event.update({ where: { id: eventId }, data: { currentParticipants: { increment: 1 } } });
    return NextResponse.json({ message: "Successfully joined the drive!" });
  } catch (error) {
    console.error("Error joining drive:", error);
    return NextResponse.json({ message: "Error joining drive." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 