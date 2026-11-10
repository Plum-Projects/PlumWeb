import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  });

  return NextResponse.json({ success: true, settings });
}

export async function PUT(request: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: 403 });
  }

  try {
    const data = await request.json();
    const backgroundImage = typeof data.backgroundImage === "string" ? data.backgroundImage.trim() : undefined;
    const invite = typeof data.discordInviteUrl === "string" ? data.discordInviteUrl.trim() : undefined;
    const validImage = (value: string) => /^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value) || /^https:\/\/[^\s"()\\]+$/.test(value);
    if ((backgroundImage && !validImage(backgroundImage)) || (invite && !/^https:\/\/discord(?:\.gg|\.com\/invite)\/[a-zA-Z0-9-]+\/?$/.test(invite))) {
      return NextResponse.json({ error: "Görsel veya Discord bağlantısı geçersiz." }, { status: 400 });
    }

    const changes = {
      announcement: typeof data.announcement === "string" ? data.announcement : undefined,
      serverIp: typeof (data.serverIp ?? data.serverIP) === "string" ? (data.serverIp ?? data.serverIP).trim() || "play.plumya.net" : undefined,
      serverPort: typeof data.serverPort === "string" && /^\d{1,5}$/.test(data.serverPort) && Number(data.serverPort) <= 65535 && Number(data.serverPort) > 0 ? data.serverPort : undefined,
      showRecentRegistrations: typeof data.showRecentRegistrations === "boolean" ? data.showRecentRegistrations : undefined,
      showRecentCredits: typeof data.showRecentCredits === "boolean" ? data.showRecentCredits : undefined,
      onlinePlayers: Number.isInteger(data.onlinePlayers) && data.onlinePlayers >= 0 && data.onlinePlayers <= 2147483647 ? data.onlinePlayers : undefined,
      maxPlayers: Number.isInteger(data.maxPlayers) && data.maxPlayers > 0 && data.maxPlayers <= 2147483647 ? data.maxPlayers : undefined,
      siteName: typeof data.siteName === "string" ? data.siteName.trim().slice(0, 80) || "Plumya Network" : undefined,
      backgroundImage: backgroundImage === "" ? "/plumya-dusk.webp" : backgroundImage,
      panelOpacity: Number.isInteger(data.panelOpacity) ? Math.max(0, Math.min(100, data.panelOpacity)) : undefined,
      showNews: typeof data.showNews === "boolean" ? data.showNews : undefined,
      discordServerId: typeof data.discordServerId === "string" ? data.discordServerId.trim() : undefined,
      discordInviteUrl: invite,
    };

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: changes,
      create: { id: "default", ...changes },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Admin settings update error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi.' }, { status: 500 });
  }
}
