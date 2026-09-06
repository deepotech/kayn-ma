import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function dbConnect(): Promise<PrismaClient> {
    return prisma;
}

const handler: ProxyHandler<typeof dbConnect> = {
    apply() {
        return prisma;
    },
    get(_target, prop, receiver) {
        return Reflect.get(prisma, prop, receiver);
    }
};

const defaultExport = new Proxy(dbConnect, handler);

export default defaultExport as unknown as PrismaClient & typeof dbConnect;

