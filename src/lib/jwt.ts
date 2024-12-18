import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  id: number;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export const signJWT = async (payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
};

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JWTPayload;
};
