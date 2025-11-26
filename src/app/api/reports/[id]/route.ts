// src/app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/roleGuard';
import { updateReportSchema } from '@/lib/validation';

type Params = {
  params: { id: string };
};

export const runtime = 'nodejs';

/**
 * GET /api/reports/:id
 * Detail laporan (hanya pemilik atau admin)
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth(req);

    const report = await prisma.laporanFasilitas.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            namaLengkap: true,
            nomorKamar: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 },
      );
    }

    // user biasa hanya boleh melihat miliknya
    if (user.role !== 'admin' && report.userId !== user.id) {
      return NextResponse.json(
        { error: 'Anda tidak boleh melihat laporan ini' },
        { status: 403 },
      );
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { error: 'Anda harus login.' },
        { status: 401 },
      );
    }
    console.error('Report GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/reports/:id
 * Update status laporan (admin only)
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth(req);

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Hanya admin yang boleh mengubah status.' },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Body request tidak valid' },
        { status: 400 },
      );
    }

    const parsed = updateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.laporanFasilitas.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 },
      );
    }

    const updated = await prisma.laporanFasilitas.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ report: updated }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { error: 'Anda harus login.' },
        { status: 401 },
      );
    }
    console.error('Report PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reports/:id
 * Hapus laporan:
 * - Admin: bisa hapus apa saja
 * - User: hanya boleh hapus miliknya sendiri & status masih BARU
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth(req);

    const existing = await prisma.laporanFasilitas.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 },
      );
    }

    if (user.role !== 'admin') {
      if (existing.userId !== user.id) {
        return NextResponse.json(
          { error: 'Anda tidak boleh menghapus laporan milik orang lain.' },
          { status: 403 },
        );
      }

      if (existing.status !== 'BARU') {
        return NextResponse.json(
          {
            error:
              'Laporan yang sudah diproses tidak bisa dihapus. Hubungi admin jika perlu koreksi.',
          },
          { status: 400 },
        );
      }
    }

    await prisma.laporanFasilitas.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { error: 'Anda harus login.' },
        { status: 401 },
      );
    }
    console.error('Report DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
