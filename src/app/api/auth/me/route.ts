import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
