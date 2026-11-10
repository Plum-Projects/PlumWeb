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
        serverAddress = settings?.serverIp || 'play.plumya.net';
      } catch {
        serverAddress = 'play.plumya.net';
      }
    }

    // Clean address (remove port if passed like play.server.com:25565)
    const host = serverAddress.split(':')[0];

    // Fetch from mcstatus.io Java status API
    const response = await fetch(
      `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host)}`,
      {
        headers: {
          'User-Agent': 'Plumya-MC-Web/1.0',
        },
        // Cache response for 30 seconds to prevent rate-limiting mcstatus.io
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        online: false,
        playersOnline: 0,
        playersMax: 200,
        error: 'mcstatus.io yanıt vermedi.',
      });
    }

    const data = await response.json();

    if (data.online) {
      return NextResponse.json({
        success: true,
        online: true,
        host: data.host,
        ipAddress: data.ip_address,
        port: data.port,
        playersOnline: data.players?.online ?? 0,
        playersMax: data.players?.max ?? 200,
        version: data.version?.name_clean || '1.16 - 1.21+',
        motd: data.motd?.clean || null,
        icon: data.icon || null,
        retrievedAt: data.retrieved_at,
      });
    } else {
      return NextResponse.json({
        success: true,
        online: false,
        host: data.host || host,
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
