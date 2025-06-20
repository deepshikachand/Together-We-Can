import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'API route is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ 
    message: "POST request received",
    receivedData: body 
  });
} 