import { Pool } from 'pg';

// Simpan Pool di global supaya tidak dibuat berkali-kali di dev (HMR)
const globalForPg = global as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Supabase pakai SSL dengan sertifikat self-signed
    },
  });

// Simpan ke global di dev
if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

// Log error pool supaya tidak jadi uncaughtException
pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
});
