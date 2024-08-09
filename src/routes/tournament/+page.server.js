import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
// import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
    const data = {
        tournaments: await prisma.tournament.findMany({}),
    };
    return data;
};

/** @type {import('./$types').Actions} */
export const actions = {
    addTournament: async ({ request }) => {
        const data = await request.formData();

        let name = data.get('name');

        try {
            await prisma.tournament.create({
                data: {
                    name: name,
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
                    id: parseInt(id),
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
};
