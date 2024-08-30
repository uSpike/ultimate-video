import { error } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { handleForm } from '$lib/server-form';

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
                            primaryPlayer: true,
                            secondaryPlayer: true,
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
    date: zfd.text(z.coerce.date()),
    tournamentId: zfd.numeric(z.number().min(0)),
    videoFile: zfd.text(),
});

const addLineSchema = zfd.formData({
    name: zfd.text(),
    tournamentId: zfd.numeric(z.number().min(0)),
});

const removeLineSchema = zfd.formData({
    lineId: zfd.numeric(z.number().min(0)),
});

const addPlayerToLineSchema = zfd.formData({
    lineId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

const removePlayerFromLineSchema = zfd.formData({
    lineId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

const addPlayerSchema = zfd.formData({
    tournamentId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

const removePlayerSchema = zfd.formData({
    tournamentId: zfd.numeric(z.number().min(0)),
    playerId: zfd.numeric(z.number().min(0)),
});

export const actions = {
    addGame: async ({ request }) => {
        return await handleForm(await request.formData(), addGameSchema, async (data) => {
            await prisma.game.create({
                data: {
                    opponent: data.opponent,
                    date: data.date,
                    tournament: { connect: { id: data.tournamentId } },
                    videoFile: data.videoFile,
                },
            });
        });
    },
    addLine: async ({ request }) => {
        return await handleForm(await request.formData(), addLineSchema, async (data) => {
            await prisma.playerLine.create({
                data: {
                    name: data.name,
                    tournament: { connect: { id: data.tournamentId } },
                },
            });
        });
    },
    removeLine: async ({ request }) => {
        return await handleForm(await request.formData(), removeLineSchema, async (data) => {
            await prisma.playerLine.delete({ where: { id: data.lineId } });
        });
    },
    addPlayerToLine: async ({ request }) => {
        return await handleForm(await request.formData(), addPlayerToLineSchema, async (data) => {
            await prisma.playerLine.update({
                where: { id: data.lineId },
                data: {
                    primaryPlayers: {
                        connect: { id: data.playerId },
                    },
                },
            });
        });
    },
    removePlayerFromLine: async ({ request }) => {
        return await handleForm(await request.formData(), removePlayerFromLineSchema, async (data) => {
            await prisma.playerLine.update({
                where: { id: data.lineId },
                data: {
                    primaryPlayers: {
                        disconnect: { id: data.playerId },
                    },
                },
            });
        });
    },
    addPlayer: async ({ request }) => {
        // connect player to tournament
        return await handleForm(await request.formData(), addPlayerSchema, async (data) => {
            await prisma.player.update({
                where: { id: data.playerId },
                data: {
                    tournaments: {
                        connect: { id: data.tournamentId },
                    },
                },
            });
        });
    },
    removePlayer: async ({ request }) => {
        // disconnect player from tournament
        return await handleForm(await request.formData(), removePlayerSchema, async (data) => {
            await prisma.player.update({
                where: { id: data.playerId },
                data: {
                    tournaments: {
                        disconnect: { id: data.tournamentId },
                    },
                },
            });
        });
    },
} satisfies Actions;
