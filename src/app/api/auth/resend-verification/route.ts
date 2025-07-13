import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Email is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'User not found'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Email is already verified'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
        userId: user.id
      }
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, user.name);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Failed to send verification email. Please try again later.'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        status: 'success',
        message: 'Verification email sent successfully. Please check your inbox.'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: 'Failed to resend verification email',
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