import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { email } = await request.json();
    const cleanEmail = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi.' }, { status: 400 });
    }

    // Check if taken by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        NOT: { id: user.id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta başka bir hesapta kayıtlı.' }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: cleanEmail },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        credits: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Profil güncellenemedi.' }, { status: 500 });
  }
}
