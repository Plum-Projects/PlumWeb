import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromCookie } from '@/lib/auth';

// GET: User gets their tickets, or admin gets all
export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const whereClause = user.role === 'admin' ? {} : { userId: user.id };

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Tickets GET error:', error);
    return NextResponse.json({ error: 'Talepler getirilemedi.' }, { status: 500 });
  }
}

// POST: Create a new ticket
export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { subject, message } = await request.json();

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Konu ve mesaj alanları zorunludur.' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        username: user.username,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
      },
      include: {
        replies: true,
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Tickets POST error:', error);
    return NextResponse.json({ error: 'Talep oluşturulamadı.' }, { status: 500 });
  }
}
