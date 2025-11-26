import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaReplica } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const mode = (req.nextUrl.searchParams.get('mode') || 'weak') as
      | 'strong'
      | 'weak';

    const client = mode === 'strong' ? prisma : prismaReplica;

    // hitung jumlah laporan per status
    const statuses = ['BARU', 'DIPROSES', 'DIKERJAKAN', 'SELESAI', 'DITOLAK'];

    const counts = await Promise.all(
      statuses.map((s) =>
        client.laporanFasilitas.count({ where: { status: s } })
      )
    );

    // statistik harian (7 hari terakhir)
    const daily = await client.$queryRaw<
      { day: string; total: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
        COUNT(*) AS total
      FROM "LaporanFasilitas"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC
    `;

    return NextResponse.json(
      {
        mode,
        perStatus: {
          BARU: counts[0],
          DIPROSES: counts[1],
          DIKERJAKAN: counts[2],
          SELESAI: counts[3],
          DITOLAK: counts[4],
        },
        perHari: daily,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
