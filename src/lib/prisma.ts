import { Prisma, PrismaClient } from '@prisma/client';
import { error } from '@sveltejs/kit';

const prisma = new PrismaClient();

export default prisma;

export function handlePrismaError(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        error(400, e.message);
    } else {
        error(400, 'Unknown error');
    }
}
