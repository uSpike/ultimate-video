import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { Prisma } from '@prisma/client';

function handlePrismaError(e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        error(400, e.message);
    } else {
        error(400, 'Unknown error');
    }
}

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
    console.log(params);
    let tournament = await prisma.tournament.findUnique({
        where: { id: Number(params.tournamentId) },
        include: { players: true, lines: true },
    });
    if (!tournament) {
        error(404, `Tournament ${params.tournamentId} not found`);
    }
    let games = await prisma.game.findMany({
        where: { tournament: { id: Number(params.tournamentId) } },
        include: { points: { include: { players: true, actions: true } } },
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

/** @type {import('./$types').Actions} */
export const actions = {
    addGame: async ({ request }) => {
        const data = await request.formData();

        let opponent = data.get('opponent');
        let date = data.get('date');
        let tournamentId = data.get('tournamentId');
        let videoFile = data.get('videoFile');

        try {
            await prisma.game.create({
                data: {
                    opponent,
                    date: new Date(date),
                    tournament: { connect: { id: Number(tournamentId) } },
                    videoFile: videoFile,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${tournamentId}`);
    },
    addLine: async ({ request }) => {
        const data = await request.formData();

        let name = data.get('name');
        let tournamentId = data.get('tournamentId');

        try {
            await prisma.playerLine.create({
                data: {
                    name,
                    tournament: { connect: { id: Number(tournamentId) } },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${tournamentId}`);
    },
    addPlayerToLine: async ({ request }) => {
        const data = await request.formData();

        let lineId = data.get('lineId');
        let playerId = data.get('playerId');

        try {
            await prisma.playerLine.update({
                where: { id: Number(lineId) },
                data: {
                    primaryPlayers: {
                        connect: { id: Number(playerId) },
                    },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${data.get('tournamentId')}`);
    },
    removePlayerFromLine: async ({ request }) => {
        const data = await request.formData();

        let lineId = data.get('lineId');
        let playerId = data.get('playerId');

        try {
            await prisma.playerLine.update({
                where: { id: Number(lineId) },
                data: {
                    primaryPlayers: {
                        disconnect: { id: Number(playerId) },
                    },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${data.get('tournamentId')}`);
    },
    newPlayer: async ({ request }) => {
        // create new player
        const data = await request.formData();

        let name = data.get('name');
        let tournamentId = data.get('tournamentId');
        let genderMatch = data.get('genderMatch');

        try {
            await prisma.player.create({
                data: {
                    name,
                    tournaments: { connect: { id: Number(tournamentId) } },
                    genderMatch: genderMatch,
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${tournamentId}`);
    },
    addPlayer: async ({ request }) => {
        // connect player to tournament
        const data = await request.formData();

        let tournamentId = data.get('tournamentId');
        let playerId = data.get('playerId');

        try {
            await prisma.player.update({
                where: { id: Number(playerId) },
                data: {
                    tournaments: {
                        connect: { id: Number(tournamentId) },
                    },
                },
            });
        } catch (e) {
            handlePrismaError(e);
        }
        throw redirect(303, `/tournament/${tournamentId}`);
    },
};
