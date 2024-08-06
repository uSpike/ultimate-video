import { error } from '@sveltejs/kit';
import prisma from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
    const tournament = await prisma.tournament.findFirst({
        where: { id: Number(params.tournamentId) },
        include: {
            games: {
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
                                    primaryPlayer: true,
                                    secondaryPlayer: true,
                                },
                            },
                        },
                    },
                },
                where: {
                    points: {
                        some: {
                            players: {
                                some: { id: Number(params.playerId) },
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
