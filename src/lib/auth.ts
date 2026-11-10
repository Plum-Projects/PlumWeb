import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

export const COOKIE_NAME = 'plumya_token';
const DEFAULT_SECRET = 'plumya_super_secret_jwt_encryption_key_2026_xK9#mQ2!vL8';

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

// ─── Password Hashing ──────────────────────────────────────────────

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(
  plainText: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// ─── JWT Signing & Verification (Edge-compatible with jose) ─────────

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      id: payload.id as string,
      username: payload.username as string,
      email: payload.email as string,
      role: (payload.role as string) || 'user',
    };
  } catch {
    return null;
  }
}

// ─── Server-Side Current User Getter ───────────────────────────────

export async function getCurrentUserFromCookie(): Promise<{
  id: string;
  username: string;
  email: string;
  role: string;
  credits: number;
} | null> {
  try {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      return null;
    }

    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.id) return null;

    // Check with PostgreSQL database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        credits: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

// ─── Require Admin Server-Side Guard ───────────────────────────────

export async function requireAdmin(): Promise<{
  authorized: boolean;
  user?: { id: string; username: string; email: string; role: string; credits: number };
  error?: string;
}> {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    return { authorized: false, error: 'Oturum açmanız gerekiyor.' };
  }
  if (user.role !== 'admin') {
    return { authorized: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }
  return { authorized: true, user };
}

// ─── In-Memory Rate Limiter (Brute-Force Protection) ────────────────

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 60 * 1000
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.expiresAt - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.count,
    retryAfterSeconds: 0,
  };
}
