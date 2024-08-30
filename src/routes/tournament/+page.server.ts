import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { handleForm } from '$lib/server-form';

export const load: PageServerLoad = async () => {
    let tournaments = await prisma.tournament.findMany({
        include: {
            lines: {
                include: {
                    primaryPlayers: true,
                },
            },
        },
    });
    let players = await prisma.player.findMany({});
    let games = await prisma.game.findMany({
        include: {
            points: {
                include: {
                    players: true,
                    actions: {
                        include: {
                            type: true,
                            notes: true,
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
        return await handleForm(await request.formData(), addTournamentSchema, async (data) => {
            await prisma.tournament.create({
                data: {
                    name: data.name,
                },
            });
        });
    },
    deleteTournament: async ({ request }) => {
        return await handleForm(await request.formData(), removeTournamentSchema, async (data) => {
            await prisma.tournament.delete({
                where: {
                    id: data.tournamentId,
                },
            });
        });
    },
} satisfies Actions;
