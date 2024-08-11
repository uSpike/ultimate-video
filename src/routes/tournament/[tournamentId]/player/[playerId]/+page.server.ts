import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const tournament = await prisma.tournament.findFirst({
        where: { id: Number(params.tournamentId) },
        include: {
            games: {
                where: {
                    points: {
                        some: {
                            players: {
                                some: { id: Number(params.playerId) },
                            },
                        },
                    },
                },
                include: {
                    points: {
                        where: {
                            players: {
                                some: { id: Number(params.playerId) },
                            },
                        },
                        include: {
                            actions: {
                                where: {
                                    OR: [
                                        { primaryPlayerId: Number(params.playerId) },
                                        { secondaryPlayerId: Number(params.playerId) },
                                    ],
                                },
                                include: {
                                    type: true,
                                    primaryPlayer: true,
                                    secondaryPlayer: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    const player = await prisma.player.findFirst({
        where: { id: Number(params.playerId) },
    });

    const data = {
        tournament: tournament,
        player: player,
    };

    return data;
};
