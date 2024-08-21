import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { handleZodError } from '$lib/zod';

export const load: PageServerLoad = async () => {
    const data = {
        players: await prisma.player.findMany({}),
    };
    return data;
};

const newPlayerSchema = zfd.formData({
    name: zfd.text(),
    genderMatch: zfd.text(z.enum(['mmp', 'fmp'])),
});

export const actions = {
    newPlayer: async ({ request }) => {
        const data = await request.formData();
        const parsed = newPlayerSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.player.create({
                data: {
                    name: parsed.data.name,
                    genderMatch: parsed.data.genderMatch,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
} satisfies Actions;
