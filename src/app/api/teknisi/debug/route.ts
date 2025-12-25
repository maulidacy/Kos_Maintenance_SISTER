import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeknisi } from "@/lib/roleGuard";

export async function GET(req: NextRequest) {
  const teknisi = await requireTeknisi(req);

  const allAssigned = await prisma.laporanFasilitas.findMany({
    where: { assignedToId: teknisi.id },
    select: { id: true, judul: true, status: true, assignedToId: true },
  });

  return NextResponse.json({
    teknisi,
    allAssigned,
  });
}
