import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { handleForm } from '$lib/server-form';

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

const updateActionSchema = zfd.formData({
    id: zfd.numeric(z.number().min(0)),
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

const updateActionNoteSchema = zfd.formData({
    id: zfd.numeric(z.number().min(0)),
    name: zfd.text(),
    description: zfd.text(),
});

const removeActionNoteSchema = zfd.formData({
    id: zfd.numeric(z.number().min(0)),
});

export const actions = {
    addActionType: async ({ request }) => {
        return await handleForm(await request.formData(), addActionSchema, async (data) => {
            await prisma.gamePointActionType.create({
                data: {
                    type: data.type,
                    description: data.description,
                    requirePrimaryPlayer: data.requirePrimaryPlayer,
                    requireSecondaryPlayer: data.requireSecondaryPlayer,
                    primaryPlayerLabel: data.primaryPlayerLabel,
                    secondaryPlayerLabel: data.secondaryPlayerLabel,
                    requireState: data.requireState,
                },
            });
        });
    },
    updateActionType: async ({ request }) => {
        return await handleForm(await request.formData(), updateActionSchema, async (data) => {
            await prisma.gamePointActionType.update({
                where: {
                    id: data.id,
                },
                data: {
                    type: data.type,
                    description: data.description,
                    requirePrimaryPlayer: data.requirePrimaryPlayer,
                    requireSecondaryPlayer: data.requireSecondaryPlayer,
                    primaryPlayerLabel: data.primaryPlayerLabel,
                    secondaryPlayerLabel: data.secondaryPlayerLabel,
                    requireState: data.requireState,
                },
            });
        });
    },
    removeActionType: async ({ request }) => {
        return await handleForm(await request.formData(), removeActionSchema, async (data) => {
            await prisma.gamePointActionType.delete({
                where: {
                    id: data.id,
                },
            });
        });
    },
    addActionNoteType: async ({ request }) => {
        return await handleForm(await request.formData(), addActionNoteSchema, async (data) => {
            await prisma.gamePointActionNoteType.create({
                data: {
                    name: data.name,
                    description: data.description,
                    type: { connect: { id: data.typeId } },
                },
            });
        });
    },
    updateActionNoteType: async ({ request }) => {
        return await handleForm(await request.formData(), updateActionNoteSchema, async (data) => {
            await prisma.gamePointActionNoteType.update({
                where: {
                    id: data.id,
                },
                data: {
                    name: data.name,
                    description: data.description,
                },
            });
        });
    },
    removeActionNoteType: async ({ request }) => {
        return await handleForm(await request.formData(), removeActionNoteSchema, async (data) => {
            await prisma.gamePointActionNoteType.delete({
                where: {
                    id: data.id,
                },
            });
        });
    },
} satisfies Actions;
