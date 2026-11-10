import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  try {
    const { title, content } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Haber başlığı ve içeriği zorunludur.' },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        author: adminCheck.user?.username || 'PlumyaAdmin',
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (error) {
    console.error('Admin create news error:', error);
    return NextResponse.json({ error: 'Haber eklenemedi.' }, { status: 500 });
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
      return NextResponse.json({ error: 'Haber ID gereklidir.' }, { status: 400 });
    }

    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Haber silindi.' });
  } catch (error) {
    console.error('Admin delete news error:', error);
    return NextResponse.json({ error: 'Haber silinemedi.' }, { status: 500 });
  }
}
