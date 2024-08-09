import { handlePrismaError } from '$lib/prisma';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const data = {
        actionTypes: await prisma.gamePointActionType.findMany({
            include: {
                notes: true,
            },
        }),
    };
    console.log(data);
    return data;
};

export const actions = {
    addActionType: async ({ request }) => {
        const data = await request.formData();

        let type = data.get('type');
        let description = data.get('description');
        let requirePrimaryPlayer = data.get('requirePrimaryPlayer');
        let requireSecondaryPlayer = data.get('requireSecondaryPlayer');
        let primaryPlayerLabel = data.get('primaryPlayerLabel');
        let secondaryPlayerLabel = data.get('secondaryPlayerLabel');
        let requireState = data.get('requireState');

        try {
            await prisma.gamePointActionType.create({
                data: {
                    type: type,
                    description: description,
                    requirePrimaryPlayer: requirePrimaryPlayer,
                    requireSecondaryPlayer: requireSecondaryPlayer,
                    primaryPlayerLabel: primaryPlayerLabel,
                    secondaryPlayerLabel: secondaryPlayerLabel,
                    requireState: requireState,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
    addActionNoteType: async ({ request }) => {
        const data = await request.formData();

        let name = data.get('name');
        let description = data.get('description');
        let typeId = data.get('typeId');

        try {
            await prisma.gamePointActionNoteType.create({
                data: {
                    name: name,
                    description: description,
                    type: { connect: { id: Number(typeId) } },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
    },
} satisfies Actions;