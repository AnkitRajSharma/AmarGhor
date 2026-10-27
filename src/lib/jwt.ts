import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'amarghor_super_secure_jwt_token_key_2026_xyz987';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'buyer' | 'seller';
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  // Check authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  }

  // Fallback to cookie
  const tokenCookie = req.cookies.get('amarghor_token');
  if (tokenCookie && tokenCookie.value) {
    return verifyToken(tokenCookie.value);
  }

  return null;
}
