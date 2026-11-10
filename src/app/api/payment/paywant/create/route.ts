import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { createPaywantPayment } from '@/lib/paywant';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Kredi satın almak için lütfen önce giriş yapınız.' },
        { status: 401 }
      );
    }

    const { packageId } = await request.json();
    if (typeof packageId !== "string" || !packageId) {
      return NextResponse.json(
        { error: 'Lütfen bir paket seçiniz.' },
        { status: 400 }
      );
    }

    const pkg = await prisma.coinPackage.findUnique({
      where: { id: packageId, active: true },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Seçilen paket bulunamadı.' },
        { status: 404 }
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      '127.0.0.1';

    const orderId = `PW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const totalCoins = pkg.coins + (pkg.bonus || 0);

    const paymentResult = await createPaywantPayment({
      orderId,
      userId: user.id,
      username: user.username,
      email: user.email,
      userIp: clientIp,
      amount: pkg.price,
      packageId: pkg.id,
      coins: totalCoins,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Ödeme oluşturulamadı.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      orderId,
      token: paymentResult.token,
      isTestMode: paymentResult.isTestMode,
    });
  } catch (error) {
    console.error('Paywant create payment error:', error);
    return NextResponse.json(
      { error: 'Ödeme başlatılırken bir hata meydana geldi.' },
      { status: 500 }
    );
  }
}
