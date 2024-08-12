import { z, type SafeParseReturnType } from 'zod';
import { error } from '@sveltejs/kit';

export function handleZodError(parsed: z.SafeParseReturnType<any, any>): asserts parsed is z.SafeParseSuccess<any> {
    if (!parsed.success) {
        const errors = parsed.error.errors.map((error) => error.message);
        error(400, errors.join(', '));
    }
}
