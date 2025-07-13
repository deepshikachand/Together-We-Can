import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Verification token is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Invalid verification token'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });

      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Verification token has expired. Please register again.'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the user's email
    await prisma.user.update({
      where: { id: verificationToken.userId! },
      data: { 
        emailVerified: new Date() 
      }
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return new NextResponse(
      JSON.stringify({
        status: 'success',
        message: 'Email verified successfully! You can now sign in to your account.'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: 'Email verification failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
} 