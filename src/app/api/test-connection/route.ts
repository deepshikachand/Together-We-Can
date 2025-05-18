import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Initialize Prisma Client with detailed logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET() {
  console.log('Test connection route accessed');
  
  try {
    // 1. Check if DATABASE_URL is set
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL is not set in environment variables');
      return NextResponse.json({
        status: 'error',
        message: 'Database URL is not configured'
      }, { status: 500 });
    }
    console.log('Database URL found:', dbUrl.replace(/mongodb:\/\/([^@]+@)?/, 'mongodb://******'));

    // 2. Attempt database connection
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Successfully connected to database');

    // 3. Test database operations
    console.log('Testing database operations...');
    const stats = {
      users: await prisma.user.count(),
      // Add counts for other models as needed
    };
    console.log('Database statistics:', stats);

    return NextResponse.json({
      status: 'success',
      message: 'Database connection and operations successful',
      details: {
        connected: true,
        databaseName: dbUrl.split('/').pop(),
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Database connection/operation failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection/operation failed',
      error: error instanceof Error ? {
        type: error.constructor.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    }, { status: 500 });
  } finally {
    // Always disconnect after operations
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
} 