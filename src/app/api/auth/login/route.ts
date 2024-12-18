import { prisma } from '../../../../lib/prisma';
import { signJWT } from '../../../../lib/jwt';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Find user by email or username (for admin)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { email: 'admin', isAdmin: true } // Special case for admin
        ]
      }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJWT({
      id: user.id,
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
      token, // Include token in response for Bearer auth
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
