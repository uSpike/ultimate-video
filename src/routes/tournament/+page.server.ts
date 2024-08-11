import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const data = {
        tournaments: await prisma.tournament.findMany({}),
    };
    return data;
};

export const actions = {
    addTournament: async ({ request }) => {
        const data = await request.formData();

        let name = data.get('name');

        try {
            await prisma.tournament.create({
                data: {
                    name: String(name),
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    deleteTournament: async ({ request }) => {
        const data = await request.formData();

        let id = data.get('tournamentId');

        try {
            await prisma.tournament.delete({
                where: {
                    id: Number(id),
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
} satisfies Actions;
