import { NextResponse } from 'next/server';
import { getSiteData } from '@/lib/site-data';

export async function GET() {
  try {

    return NextResponse.json(await getSiteData(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json(
      { error: 'Veri yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
