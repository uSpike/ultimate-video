import { error } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { handleForm } from '$lib/server-form';

export const load: PageServerLoad = async ({ params }) => {
    const data = {
        tournament: await prisma.tournament.findFirstOrThrow({
            where: { id: Number(params.tournamentId) },
            include: {
                games: true,
                lines: {
                    include: {
                        primaryPlayers: true,
                    },
                },
                players: {
                    include: {
                        lines: true,
                    },
                },
            },
        }),
        game: await prisma.game.findUniqueOrThrow({
            where: { id: Number(params.gameId) },
        }),
        points: await prisma.gamePoint.findMany({
            where: { gameId: Number(params.gameId) },
            orderBy: { startTime: 'asc' },
            include: {
                line: true,
                players: true,
                actions: {
                    include: {
                        type: true,
                        notes: true,
                        primaryPlayer: true,
                        secondaryPlayer: true,
                    },
                    orderBy: { time: 'asc' },
                },
            },
        }),
        actionTypes: await prisma.gamePointActionType.findMany({
            include: {
                notes: true,
            },
        }),
    };

    if (!data.game) {
        error(404, 'Game not found');
    }
    return data;
};

const submitPointSchema = zfd.formData({
    gameId: zfd.numeric(z.number().min(0)),
    lineId: zfd.numeric(z.number().min(0)),
    players: zfd.repeatable(z.array(zfd.numeric(z.number().min(0)))),
    startTime: zfd.numeric(z.number().min(0)),
    endTime: zfd.numeric(z.number().min(0)),
    offenseDefense: z.enum(['Offense', 'Defense']),
    actions: zfd.json(
        z.array(
            z.object({
                typeId: z.number().min(0),
                time: z.number().min(0),
                notes: z.array(z.number().min(0)),
                comment: z.string().nullable(),
                offenseDefense: z.enum(['Offense', 'Defense']),
                primaryPlayerId: z.number().optional(),
                secondaryPlayerId: z.number().optional(),
            }),
        ),
    ),
});

const deletePointSchema = zfd.formData({
    pointId: zfd.numeric(z.number().min(0)),
});

export const actions = {
    submitPoint: async ({ request }) => {
        return await handleForm(await request.formData(), submitPointSchema, async (data) => {
            await prisma.gamePoint.create({
                data: {
                    game: { connect: { id: data.gameId } },
                    line: { connect: { id: data.lineId } },
                    startTime: data.startTime,
                    endTime: data.endTime,
                    offenseDefense: data.offenseDefense,
                    players: {
                        connect: data.players.map((num) => ({ id: num })),
                    },
                    actions: {
                        create: data.actions.map((action) => ({
                            type: { connect: { id: action.typeId } },
                            time: action.time,
                            notes: { connect: action.notes.map((note) => ({ id: note })) },
                            comment: action.comment,
                            offenseDefense: action.offenseDefense,
                            primaryPlayer: action.primaryPlayerId
                                ? { connect: { id: action.primaryPlayerId } }
                                : undefined,
                            secondaryPlayer: action.secondaryPlayerId
                                ? { connect: { id: action.secondaryPlayerId } }
                                : undefined,
                        })),
                    },
                },
            });
        });
    },
    deletePoint: async ({ request }) => {
        return await handleForm(await request.formData(), deletePointSchema, async (data) => {
            await prisma.gamePoint.delete({
                where: { id: data.pointId },
            });
        });
    },
} satisfies Actions;
