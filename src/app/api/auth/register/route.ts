import { prisma } from '../../../../lib/prisma';
import { signJWT } from '../../../../lib/jwt';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: false, // Default to non-admin
        rateLimit: 60 // Default rate limit
      }
    });

    const token = signJWT({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
