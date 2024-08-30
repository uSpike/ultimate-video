import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';

export async function handleForm<T extends z.infer<S>, S extends z.ZodTypeAny>(
    data: FormData,
    schema: S,
    callback: (data: T) => Promise<void>,
) {
    try {
        const parsed = schema.parse(data);
        await callback(parsed);
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = err.errors.reduce(
                (acc, error) => {
                    acc[error.path[0]] = error.message;
                    return acc;
                },
                {} as Record<string, string>,
            );
            return fail(400, { errors });
        } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return fail(400, { message: err.message });
        } else {
            return fail(400, { message: 'Unknown error' });
        }
    }
}
