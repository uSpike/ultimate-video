import { handlePrismaError } from '$lib/prisma';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';

export const load: PageServerLoad = async () => {
    const data = {
        actionTypes: await prisma.gamePointActionType.findMany({
            include: {
                notes: true,
            },
        }),
    };
    return data;
};

const addActionSchema = zfd.formData({
    type: zfd.text(),
    description: zfd.text(),
    requirePrimaryPlayer: zfd.text(z.enum(['true', 'false', 'optional'])),
    requireSecondaryPlayer: zfd.text(z.enum(['true', 'false', 'optional'])),
    primaryPlayerLabel: zfd.text(z.string().optional()),
    secondaryPlayerLabel: zfd.text(z.string().optional()),
    requireState: zfd.text(z.enum(['offense', 'defense', 'any'])),
});

const removeActionSchema = zfd.formData({
    id: zfd.numeric(z.number().min(0)),
});

const addActionNoteSchema = zfd.formData({
    name: zfd.text(),
    description: zfd.text(),
    typeId: zfd.numeric(z.number().min(0)),
});

const removeActionNoteSchema = zfd.formData({
    id: zfd.numeric(z.number().min(0)),
});

export const actions = {
    addActionType: async ({ request }) => {
        const data = await request.formData();
        const parsed = addActionSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message,
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            await prisma.gamePointActionType.create({
                data: {
                    type: parsed.data.type,
                    description: parsed.data.description,
                    requirePrimaryPlayer: parsed.data.requirePrimaryPlayer,
                    requireSecondaryPlayer: parsed.data.requireSecondaryPlayer,
                    primaryPlayerLabel: parsed.data.primaryPlayerLabel,
                    secondaryPlayerLabel: parsed.data.secondaryPlayerLabel,
                    requireState: parsed.data.requireState,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    removeActionType: async ({ request }) => {
        const data = await request.formData();
        const parsed = removeActionSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message,
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            await prisma.gamePointActionType.delete({
                where: {
                    id: parsed.data.id,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    addActionNoteType: async ({ request }) => {
        const data = await request.formData();
        const parsed = addActionNoteSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message,
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            await prisma.gamePointActionNoteType.create({
                data: {
                    name: parsed.data.name,
                    description: parsed.data.description,
                    type: { connect: { id: parsed.data.typeId } },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    removeActionNoteType: async ({ request }) => {
        const data = await request.formData();
        const parsed = removeActionNoteSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message,
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            await prisma.gamePointActionNoteType.delete({
                where: {
                    id: parsed.data.id,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
} satisfies Actions;
