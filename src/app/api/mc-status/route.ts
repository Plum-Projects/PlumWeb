import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let serverAddress = searchParams.get('server')?.trim();

    // If not provided in query, read from PostgreSQL site settings
    if (!serverAddress) {
      try {
        const settings = await prisma.siteSettings.findUnique({
          where: { id: 'default' },
        });
        const ip = settings?.serverIp || 'play.plumya.net';
        const port = settings?.serverPort;
        serverAddress = port && port !== '25565' ? `${ip}:${port}` : ip;
      } catch {
        serverAddress = 'play.plumya.net';
      }
    }

    // Fetch from mcsrvstat.us v3 status API
    const response = await fetch(
      `https://api.mcsrvstat.us/3/${encodeURIComponent(serverAddress)}`,
      {
        headers: {
          'User-Agent': 'Plumya-MC-Web/1.0',
        },
        // Cache response for 30 seconds
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        online: false,
        playersOnline: 0,
        playersMax: 200,
        error: 'mcsrvstat.us yanıt vermedi.',
      });
    }

    const data = await response.json();

    if (data.online) {
      const motdClean = Array.isArray(data.motd?.clean)
        ? data.motd.clean.join(' ')
        : (data.motd?.clean || null);

      return NextResponse.json({
        success: true,
        online: true,
        host: data.hostname || serverAddress,
        ipAddress: data.ip,
        port: data.port,
        playersOnline: data.players?.online ?? 0,
        playersMax: data.players?.max ?? 200,
        version: typeof data.version === 'string' ? data.version : (data.protocol?.name || '1.16 - 1.21+'),
        motd: motdClean,
        icon: data.icon || null,
        retrievedAt: Date.now(),
      });
    } else {
      return NextResponse.json({
        success: true,
        online: false,
        host: data.hostname || serverAddress,
        playersOnline: 0,
        playersMax: 200,
        motd: null,
      });
    }
  } catch (error) {
    console.error('MC Status API error:', error);
    return NextResponse.json(
      {
        success: false,
        online: false,
        playersOnline: 0,
        playersMax: 200,
        error: 'Sunucu durumu kontrol edilirken hata oluştu.',
      },
      { status: 500 }
    );
  }
}
