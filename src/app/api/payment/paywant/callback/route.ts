import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPaywantCallbackHash } from '@/lib/paywant';
import { publishCreditUpdate } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    let body: Record<string, string> = {};

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } else {
      body = await request.json();
    }

    const {
      SiparisID,
      ExtraData,
      UserIP,
      Status,
      Hash,
    } = body;

    if (typeof SiparisID !== 'string' || !SiparisID || typeof ExtraData !== 'string' || !ExtraData || typeof Hash !== 'string' || !Hash) {
      return new NextResponse('INVALID_PARAMS', { status: 400 });
    }

    // Verify cryptographic signature from Paywant
    const isValid = verifyPaywantCallbackHash(SiparisID, ExtraData, UserIP || '127.0.0.1', Hash);
    if (!isValid) {
      console.warn('Paywant callback signature mismatch:', { SiparisID });
      return new NextResponse('BAD_HASH', { status: 403 });
    }

    // Parse extra data
    let extra: {
      orderId: string;
      userId: string;
      username: string;
      packageId: string;
      coins: number;
      amount: number;
    };

    try {
      extra = JSON.parse(ExtraData);
    } catch {
      return new NextResponse('INVALID_EXTRA_DATA', { status: 400 });
    }

    // Paywant Status == 100 indicates SUCCESS
    if (String(Status) === '100') {
      if (!extra || typeof extra.userId !== 'string' || !extra.userId ||
          typeof extra.packageId !== 'string' || !extra.packageId ||
          !Number.isInteger(extra.coins) || extra.coins <= 0 || extra.coins > 2147483647 ||
          !Number.isFinite(extra.amount) || extra.amount <= 0) {
        return new NextResponse('INVALID_EXTRA_DATA', { status: 400 });
      }

      const { userId, packageId, coins, amount } = extra;
      const username = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.createMany({
          data: { userId, packageId, coins, amount, orderId: SiparisID, status: 'success' },
          skipDuplicates: true,
        });
        if (payment.count === 0) return null;

        const user = await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: coins } },
          select: { username: true },
        });
        await tx.creditLoad.create({ data: { userId, username: user.username, amount: coins } });
        return user.username;
      });

      if (username) await publishCreditUpdate(username, coins, 'ADD');
      // Paywant expects exact string "OK" with 200 OK status
      return new NextResponse('OK', { status: 200 });
    } else {
      console.log(`Paywant payment failed or cancelled: Order ${SiparisID}, Status ${Status}`);
      return new NextResponse('OK', { status: 200 });
    }
  } catch (error) {
    console.error('Paywant callback error:', error);
    return new NextResponse('SERVER_ERROR', { status: 500 });
  }
}
