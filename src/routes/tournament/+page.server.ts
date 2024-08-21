import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { handleZodError } from '$lib/zod';

export const load: PageServerLoad = async () => {
    let tournaments = await prisma.tournament.findMany({});
    let players = await prisma.player.findMany({});
    let games = await prisma.game.findMany({
        include: {
            points: {
                include: {
                    players: true,
                    actions: {
                        include: {
                            type: true,
                        },
                    },
                },
            },
        },
    });
    const data = {
        tournaments: tournaments,
        players: players,
        games: games,
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
