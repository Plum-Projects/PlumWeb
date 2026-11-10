import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { id: ticketId } = await params;
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mesaj boş bırakılamaz.' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Destek talebi bulunamadı.' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';

    // Users can only reply to their own tickets unless admin
    if (!isAdmin && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Bu talebe yanıt verme yetkiniz yok.' }, { status: 403 });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        userId: user.id,
        username: user.username,
        message: message.trim(),
        isAdmin,
      },
    });

    // Update status to 'answered' if admin replied
    if (isAdmin) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'answered' },
      });
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Ticket reply error:', error);
    return NextResponse.json({ error: 'Yanıt gönderilemedi.' }, { status: 500 });
  }
}
