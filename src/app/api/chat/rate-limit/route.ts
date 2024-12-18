import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { verifyJWT, JWTPayload } from '@/lib/jwt';

interface UserInfo {
  id: number;
  email: string;
  isAdmin: boolean;
}

export async function GET(req: Request) {
  try {
    const userJson = req.headers.get('x-user-json');
    if (!userJson) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userJson) as UserInfo;
    const remaining = await checkRateLimit(user.id);

    if (remaining <= 0) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    return NextResponse.json({ remaining });
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user info
    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit using user id
    const remaining = await checkRateLimit(payload.id);

    if (remaining <= 0) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    return NextResponse.json({ remaining });
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
