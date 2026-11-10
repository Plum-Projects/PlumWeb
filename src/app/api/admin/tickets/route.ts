import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  const tickets = await prisma.ticket.findMany({
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, tickets });
}

export async function PUT(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !['open', 'answered', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz talep durumu.' }, { status: 400 });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Admin ticket status update error:', error);
    return NextResponse.json({ error: 'Talep güncellenemedi.' }, { status: 500 });
  }
}
