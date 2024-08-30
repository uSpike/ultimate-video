import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const tournament = await prisma.tournament.findFirstOrThrow({
        where: { id: Number(params.tournamentId) },
        include: {
            games: {
                include: {
                    points: {
                        where: { lineId: Number(params.lineId) },
                        include: {
                            actions: true,
                        },
                    },
                },
            },
        },
    });

    const line = await prisma.playerLine.findFirstOrThrow({
        where: { id: Number(params.lineId) },
        include: {
            primaryPlayers: true,
        },
    });

    const data = {
        tournament: tournament,
        line: line,
    };

    return data;
};
