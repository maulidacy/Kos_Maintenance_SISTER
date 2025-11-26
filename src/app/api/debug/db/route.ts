import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    return NextResponse.json(
      {
        ok: true,
        now: result.rows[0].now,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error('DB debug error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || 'unknown',
        code: err?.code || null,
      },
      { status: 500 },
    );
  }
}
