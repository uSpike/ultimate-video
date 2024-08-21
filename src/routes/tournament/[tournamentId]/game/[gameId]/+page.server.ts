import { fail, error } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { handleZodError } from '$lib/zod';

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
        const data = await request.formData();
        const parsed = submitPointSchema.safeParse(data);
        handleZodError(parsed);

        await prisma.gamePoint.create({
            data: {
                game: { connect: { id: parsed.data.gameId } },
                line: { connect: { id: parsed.data.lineId } },
                startTime: parsed.data.startTime,
                endTime: parsed.data.endTime,
                offenseDefense: parsed.data.offenseDefense,
                players: {
                    connect: parsed.data.players.map((num) => ({ id: num })),
                },
                actions: {
                    create: parsed.data.actions.map((action) => ({
                        type: { connect: { id: action.typeId } },
                        time: action.time,
                        notes: { connect: action.notes.map((note) => ({ id: note })) },
                        comment: action.comment,
                        offenseDefense: action.offenseDefense,
                        primaryPlayer: Number.isInteger(action.primaryPlayerId)
                            ? { connect: { id: action.primaryPlayerId } }
                            : undefined,
                        secondaryPlayer: Number.isInteger(action.secondaryPlayerId)
                            ? { connect: { id: action.secondaryPlayerId } }
                            : undefined,
                    })),
                },
            },
        });
    },
    deletePoint: async ({ request }) => {
        const data = await request.formData();
        const parsed = deletePointSchema.safeParse(Object.fromEntries(data));
        handleZodError(parsed);

        await prisma.gamePoint.delete({
            where: { id: parsed.data.pointId },
        });
    },
} satisfies Actions;
