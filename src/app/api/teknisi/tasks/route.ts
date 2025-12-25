// src/app/api/teknisi/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeknisi } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        const teknisi = await requireTeknisi(req);

        const tasks = await prisma.laporanFasilitas.findMany({
            where: {
                assignedToId: teknisi.id,
                status: { in: ['DIPROSES', 'DIKERJAKAN'] },
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                judul: true,
                kategori: true,
                prioritas: true,
                status: true,
                lokasi: true,
                createdAt: true,
                receivedAt: true,
                startedAt: true,
                resolvedAt: true,
                user: {
                    select: {
                        namaLengkap: true,
                        nomorKamar: true,
                        email: true,
                    },
                },
            },
        });



        return NextResponse.json({ tasks }, { status: 200 });
    } catch (err: any) {
        console.error('GET /teknisi/tasks error:', err);

        if (err?.message === 'UNAUTHENTICATED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (err?.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
