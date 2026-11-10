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

    const [host, port] = serverAddress.split(':');

    // 1. Try minetools.eu (handles Hypixel and Cloudflare Spectrum proxies properly)
    try {
      const minetoolsUrl = port
        ? `https://api.minetools.eu/ping/${encodeURIComponent(host)}/${encodeURIComponent(port)}`
        : `https://api.minetools.eu/ping/${encodeURIComponent(host)}`;

      const response = await fetch(minetoolsUrl, {
        headers: { 'User-Agent': 'Plumya-MC-Web/1.0' },
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.error && data.players) {
          const motdClean = typeof data.description === 'string'
            ? data.description.replace(/§[0-9a-fk-or]/gi, '').trim()
            : null;

          return NextResponse.json({
            success: true,
            online: true,
            host: serverAddress,
            playersOnline: data.players.online ?? 0,
            playersMax: data.players.max ?? 200,
            version: data.version?.name || '1.16 - 1.21+',
            motd: motdClean,
            icon: data.favicon || null,
            retrievedAt: Date.now(),
          });
        }
      }
    } catch {
      // Minetools failed or timed out, proceed to fallback
    }

    // 2. Fallback to mcsrvstat.us v3
    try {
      const response = await fetch(
        `https://api.mcsrvstat.us/3/${encodeURIComponent(serverAddress)}`,
        {
          headers: { 'User-Agent': 'Plumya-MC-Web/1.0' },
          next: { revalidate: 30 },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (response.ok) {
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
        }
      }
    } catch {
      // mcsrvstat failed or timed out
    }

    // If both services reported offline or failed
    return NextResponse.json({
      success: true,
      online: false,
      host: serverAddress,
      playersOnline: 0,
      playersMax: 200,
      motd: null,
    });
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
