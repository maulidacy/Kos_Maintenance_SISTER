// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaReplica: PrismaClient | undefined;
};

// PRIMARY: jangan override datasource manual
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

// REPLICA: optional, hanya dibuat kalau env ada
const replicaUrl = process.env.REPLICA_DATABASE_URL;

export const prismaReplica =
  replicaUrl
    ? globalForPrisma.prismaReplica ??
      new PrismaClient({
        datasources: { db: { url: replicaUrl } },
      })
    : undefined;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  if (prismaReplica) globalForPrisma.prismaReplica = prismaReplica;
}
