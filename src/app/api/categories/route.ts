import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = [
      { id: "1", name: "Education", description: "Events related to teaching, learning, and knowledge sharing." },
      { id: "2", name: "Environment", description: "Activities focused on sustainability and environmental conservation." },
      { id: "3", name: "Health", description: "Health and wellness initiatives, including fitness drives and medical camps." },
      { id: "4", name: "Community Service", description: "Social drives to help the underprivileged or support local communities." },
      { id: "5", name: "Arts and Culture", description: "Promoting art, music, theater, and cultural heritage." },
      { id: "6", name: "Sports", description: "Events related to physical activities, competitions, and sportsmanship." }
    ];

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Error fetching categories" },
      { status: 500 }
    );
  }
} 