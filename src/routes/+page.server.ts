import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { handleForm } from '$lib/server-form';

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
        await handleForm(await request.formData(), newPlayerSchema, async (data) => {
            await prisma.player.create({
                data: {
                    name: data.name,
                    genderMatch: data.genderMatch,
                },
            });
        });
    },
    removePlayer: async ({ request }) => {
        await handleForm(await request.formData(), zfd.formData({ playerId: zfd.numeric() }), async (data) => {
            await prisma.player.delete({
                where: { id: data.playerId },
            });
        });
    },
} satisfies Actions;
