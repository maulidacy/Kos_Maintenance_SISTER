import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaReplica?: PrismaClient;
};

// Primary: Supabase (DATABASE_URL)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

// Replica: Neon (REPLICA_DATABASE_URL)
// Kalau REPLICA_DATABASE_URL belum di-set, fallback ke DATABASE_URL
export const prismaReplica =
  globalForPrisma.prismaReplica ??
  new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.REPLICA_DATABASE_URL ||
          process.env.DATABASE_URL!, // fallback agar tidak crash
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaReplica = prismaReplica;
}
