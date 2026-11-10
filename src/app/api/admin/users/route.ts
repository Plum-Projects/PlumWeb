import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { publishCreditUpdate } from '@/lib/redis';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, users });
}

export async function PUT(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  try {
    const { id, role, credits } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    const updateData: { role?: string; credits?: number } = {};
    if (role && ['user', 'admin', 'moderator'].includes(role)) {
      updateData.role = role;
    }
    if (credits !== undefined) {
      if (!Number.isInteger(credits) || credits < 0 || credits > 2147483647) {
        return NextResponse.json({ error: 'Geçerli bir kredi bakiyesi girin.' }, { status: 400 });
      }
      updateData.credits = credits;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        credits: true,
        createdAt: true,
      },
    });

    // Yönetici panelinden bakiye değiştirildiğinde oyuna anlık yansıt
    if (updateData.credits !== undefined) {
      await publishCreditUpdate(updatedUser.username, updatedUser.credits, 'SET');
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir.' }, { status: 400 });
    }

    // Protect against admin deleting themselves
    if (id === adminCheck.user?.id) {
      return NextResponse.json(
        { error: 'Kendi yönetici hesabınızı silemezsiniz.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kullanıcı silindi.' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Kullanıcı silinemedi.' }, { status: 500 });
  }
}
