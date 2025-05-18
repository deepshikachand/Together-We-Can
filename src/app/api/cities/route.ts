import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cities = [
      { id: "1", name: "Mumbai", state: "Maharashtra" },
      { id: "2", name: "Delhi", state: "Delhi" },
      { id: "3", name: "Bangalore", state: "Karnataka" },
      { id: "4", name: "Hyderabad", state: "Telangana" },
      { id: "5", name: "Chennai", state: "Tamil Nadu" },
      { id: "6", name: "Kolkata", state: "West Bengal" },
      { id: "7", name: "Pune", state: "Maharashtra" },
      { id: "8", name: "Ahmedabad", state: "Gujarat" },
      { id: "9", name: "Jaipur", state: "Rajasthan" },
      { id: "10", name: "Lucknow", state: "Uttar Pradesh" }
    ];

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { message: "Error fetching cities" },
      { status: 500 }
    );
  }
} 