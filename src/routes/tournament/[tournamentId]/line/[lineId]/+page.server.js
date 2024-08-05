import { error } from '@sveltejs/kit';
import prisma from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const tournament = await prisma.tournament.findFirst({
		where: { id: Number(params.tournamentId) },
		include: {
			games: {
				include: {
					points: {
						where: { lineId: Number(params.lineId) },
						include: {
							actions: true
						}
					}
				}
			}
		}
	});

	const line = await prisma.playerLine.findFirst({
		where: { id: Number(params.lineId) },
		include: {
			primaryPlayers: true
		}
	});

	const data = {
		tournament: tournament,
		line: line
	};

	return data;
};
