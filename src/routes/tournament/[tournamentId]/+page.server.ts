import { fail, error, redirect } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { handlePrismaError } from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { handleZodError } from '$lib/zod';

export const load: PageServerLoad = async ({ params }) => {
    let tournament = await prisma.tournament.findUniqueOrThrow({
        where: { id: Number(params.tournamentId) },
        include: { players: true, lines: true },
    });
    if (!tournament) {
        error(404, `Tournament ${params.tournamentId} not found`);
    }
    let games = await prisma.game.findMany({
        where: { tournament: { id: Number(params.tournamentId) } },
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
    let lines = await prisma.playerLine.findMany({
        where: { tournamentId: Number(params.tournamentId) },
        include: { primaryPlayers: true },
    });
    let players = await prisma.player.findMany();
    const data = {
        tournament: tournament,
        games: games,
        lines: lines,
        players: players,
    };
    return data;
};

const addGameSchema = zfd.formData({
    opponent: zfd.text(),
    date: z.date(),
    tournamentId: zfd.numeric(z.number().min(0)),
    videoFile: zfd.text(),
});

const addLineSchema = zfd.formData({
    name: zfd.text(),
    tournamentId: zfd.numeric(z.number().min(0)),
});

const addPlayerToLineSchema = zfd.formData({
    lineId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

const removePlayerFromLineSchema = zfd.formData({
    lineId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

const newPlayerSchema = zfd.formData({
    name: zfd.text(),
    tournamentId: zfd.numeric(z.number().min(0)),
    genderMatch: z.enum(['mmp', 'fmp']),
});

const addPlayerSchema = zfd.formData({
    tournamentId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

export const actions = {
    addGame: async ({ request }) => {
        const data = await request.formData();
        const parsed = addGameSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.game.create({
                data: {
                    opponent: parsed.data.opponent,
                    date: parsed.data.date,
                    tournament: { connect: { id: parsed.data.tournamentId } },
                    videoFile: parsed.data.videoFile,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${parsed.data.tournamentId}`);
    },
    addLine: async ({ request }) => {
        const data = await request.formData();
        const parsed = addLineSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.playerLine.create({
                data: {
                    name: parsed.data.name,
                    tournament: { connect: { id: parsed.data.tournamentId } },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${parsed.data.tournamentId}`);
    },
    addPlayerToLine: async ({ request }) => {
        const data = await request.formData();
        const parsed = addPlayerToLineSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.playerLine.update({
                where: { id: parsed.data.lineId },
                data: {
                    primaryPlayers: {
                        connect: { id: parsed.data.playerId },
                    },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    removePlayerFromLine: async ({ request }) => {
        const data = await request.formData();
        const parsed = removePlayerFromLineSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.playerLine.update({
                where: { id: parsed.data.lineId },
                data: {
                    primaryPlayers: {
                        disconnect: { id: parsed.data.playerId },
                    },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${data.get('tournamentId')}`);
    },
    newPlayer: async ({ request }) => {
        const data = await request.formData();
        const parsed = newPlayerSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.player.create({
                data: {
                    name: parsed.data.name,
                    tournaments: { connect: { id: parsed.data.tournamentId } },
                    genderMatch: parsed.data.genderMatch,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${parsed.data.tournamentId}`);
    },
    addPlayer: async ({ request }) => {
        // connect player to tournament
        const data = await request.formData();
        const parsed = addPlayerSchema.safeParse(data);
        handleZodError(parsed);

        try {
            await prisma.player.update({
                where: { id: parsed.data.playerId },
                data: {
                    tournaments: {
                        connect: { id: parsed.data.tournamentId },
                    },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
} satisfies Actions;
