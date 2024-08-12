import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { handleZodError } from '$lib/zod';

export const load: PageServerLoad = async () => {
    const data = {
        tournaments: await prisma.tournament.findMany({}),
    };
    return data;
};

const addTournamentSchema = zfd.formData({
    name: zfd.text(),
});

const removeTournamentSchema = zfd.formData({
    tournamentId: zfd.numeric(z.number().min(0)),
});

export const actions = {
    addTournament: async ({ request }) => {
        const data = await request.formData();
        const parsed = addTournamentSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.tournament.create({
                data: {
                    name: parsed.data.name,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    deleteTournament: async ({ request }) => {
        const data = await request.formData();
        const parsed = removeTournamentSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.tournament.delete({
                where: {
                    id: parsed.data.tournamentId,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
} satisfies Actions;
