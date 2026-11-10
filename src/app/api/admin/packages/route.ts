import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

  const packages = await prisma.coinPackage.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json({ packages });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

  const data = await request.json().catch(() => null);
  const name = typeof data?.name === "string" ? data.name.trim() : "";
  const validAmount = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 1_000_000;
  if (!name || name.length > 80 || !validAmount(data.coins) || !data.coins ||
      !validAmount(data.bonus) || data.coins + data.bonus > 1_000_000 ||
      typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0 ||
      data.price > 1_000_000 || typeof data.active !== "boolean" || typeof data.popular !== "boolean") {
    return NextResponse.json({ error: "Paket adı, kredi ve fiyat alanlarını kontrol edin." }, { status: 400 });
  }

  const changes = { name, coins: data.coins, price: data.price, bonus: data.bonus, active: data.active, popular: data.popular };
  if (typeof data.id === "string" && data.id) {
    const result = await prisma.coinPackage.updateMany({ where: { id: data.id }, data: changes });
    if (!result.count) return NextResponse.json({ error: "Paket bulunamadı." }, { status: 404 });
  } else {
    await prisma.coinPackage.create({ data: changes });
  }
  return NextResponse.json({ success: true });
}
