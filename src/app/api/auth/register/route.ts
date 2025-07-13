import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

// Initialize Prisma Client with logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(request: Request) {
  console.log('--- Registration API called ---'); // Debug log
  console.log('Registration endpoint accessed');

  try {
    // 1. Parse and validate request body
    let body;
    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);
      body = JSON.parse(rawBody);
      console.log('Parsed request body:', {
        ...body,
        password: body.password ? '[REDACTED]' : undefined
      });
    } catch (parseError) {
      console.error('Request parsing failed:', parseError);
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Invalid request format',
          details: parseError instanceof Error ? parseError.message : 'Failed to parse request body'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { name, email, password, age, gender, city, phone } = body;

    // Validate required fields
    if (!name || !email || !password || !age || !gender || !city || !phone) {
      const missingFields = Object.entries({ name, email, password, age, gender, city, phone })
        .filter(([_, value]) => !value)
        .map(([field]) => field);

      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Missing required fields',
          missingFields
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Invalid email format'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Phone number already registered'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Create new user (initially unverified)
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        age: parseInt(age),
        gender,
        city,
        phone,
        role: "user",
        emailVerified: null // User starts as unverified
      }
    });

    // 4. Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
        userId: newUser.id
      }
    });

    // 5. Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, name);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Optionally delete the user if email fails, or just log the error
      // For now, we'll keep the user but log the error
    }

    // 6. Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    return new NextResponse(
      JSON.stringify({
        status: 'success',
        message: 'User registered successfully. Please check your email to verify your account.',
        user: userWithoutPassword,
        emailSent: emailResult.success
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: 'Registration failed',
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
  // Fallback response in case nothing else is returned
  console.error('No response sent from registration API');
  return new NextResponse(
    JSON.stringify({
      status: 'error',
      message: 'No response sent from registration API',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
} 