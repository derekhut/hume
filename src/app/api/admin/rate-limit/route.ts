import { prisma } from '../../../../lib/prisma';
import { updateUserRateLimit } from '../../../../lib/rate-limiter';
import { verifyJWT } from '../../../../lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, rateLimit } = await req.json();

    if (typeof userId !== 'number' || typeof rateLimit !== 'number' || rateLimit < 1) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }

    await updateUserRateLimit(userId, rateLimit);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Rate limit update error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
