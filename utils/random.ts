const adjectives = ['快乐的', '聪明的', '可爱的', '酷酷的'];
const nouns = ['熊猫', '老虎', '狮子', '兔子'];

export const generateRandomUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
};

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateAvatarUrl(seed?: string): string {
  // Generate a random size between 150 and 200 pixels
  const size = Math.floor(Math.random() * 51) + 150;
  return `https://i.pravatar.cc/${size}`;
}

export function getAvatarUrl(userAvatarUrl?: string | null): string {
  if (!userAvatarUrl) {
    return '/default-avatar.png';
  }
  return userAvatarUrl;
}

// Simple string hash function
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
