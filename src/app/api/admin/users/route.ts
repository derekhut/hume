import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin users route - Headers:', Object.fromEntries(request.headers.entries()));

    // Get user info from headers set by middleware
    const userJson = request.headers.get('x-user-json');
    console.log('User JSON from header:', userJson);

    if (!userJson) {
      console.error('No user header found');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userJson);
    console.log('Parsed user from header:', user);

    if (!user.isAdmin) {
      console.log('Non-admin user attempting to access admin route');
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isAdmin: true,
        rateLimit: true,
        createdAt: true,
      },
    });

    return Response.json({ users });
  } catch (error) {
    console.error('Admin users route error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
