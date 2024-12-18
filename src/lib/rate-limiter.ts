import { prisma } from './prisma';

interface RateLimitInfo {
  userId: number;
  count: number;
  lastReset: Date;
  limit: number;
}

const rateLimits: Map<number, RateLimitInfo> = new Map();

export async function checkRateLimit(userId: number): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return 0;
    }

    const now = new Date();
    const limitInfo = rateLimits.get(userId);

    if (!limitInfo || isNewMinute(limitInfo.lastReset, now)) {
      rateLimits.set(userId, {
        userId,
        count: 1,
        lastReset: now,
        limit: user.rateLimit
      });
      return user.rateLimit - 1;
    }

    if (limitInfo.count >= limitInfo.limit) {
      return 0;
    }

    limitInfo.count += 1;
    rateLimits.set(userId, limitInfo);
    return limitInfo.limit - limitInfo.count;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return 0;
  }
}

function isNewMinute(lastReset: Date, now: Date): boolean {
  return lastReset.getMinutes() !== now.getMinutes() ||
         lastReset.getHours() !== now.getHours() ||
         lastReset.getDate() !== now.getDate() ||
         lastReset.getMonth() !== now.getMonth() ||
         lastReset.getFullYear() !== now.getFullYear();
}

export async function updateUserRateLimit(userId: number, newLimit: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { rateLimit: newLimit }
  });

  const limitInfo = rateLimits.get(userId);
  if (limitInfo) {
    limitInfo.limit = newLimit;
    rateLimits.set(userId, limitInfo);
  }
}
