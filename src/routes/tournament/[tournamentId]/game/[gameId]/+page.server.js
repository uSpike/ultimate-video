import { error } from '@sveltejs/kit';
import prisma from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const data = {
		tournament: await prisma.tournament.findFirst({
			where: { id: Number(params.tournamentId) },
			include: {
				games: true,
				lines: true,
				players: {
					include: {
						lines: true,
					},
				}
			}
		}),
		game: await prisma.game.findUnique({
			where: { id: Number(params.gameId) }
		}),
		points: await prisma.gamePoint.findMany({
			where: { gameId: Number(params.gameId) },
			orderBy: { startTime: 'asc' },
			include: {
				line: true,
				players: true,
				actions: {
					include: {
						primaryPlayer: true,
						secondaryPlayer: true
					},
					orderBy: { time: 'asc' }
				}
			}
		})
	};

	if (!data.game) {
		error(404, 'Game not found');
	}
	return data;
};

/** @type {import('./$types').Actions} */
export const actions = {
	submitPoint: async ({ request }) => {
		const data = await request.formData();

		let gameId = data.get('gameId');
		let lineId = data.get('lineId');
		let players = data.getAll('players');
		let startTime = data.get('startTime');
		let endTime = data.get('endTime');
		let offenseDefense = data.get('offenseDefense');
		let actions = JSON.parse(data.get('actions'));

		await prisma.gamePoint.create({
			data: {
				game: { connect: { id: Number(gameId) } },
				line: { connect: { id: Number(lineId) } },
				startTime: Number(startTime),
				endTime: Number(endTime),
				offenseDefense: offenseDefense,
				players: {
					connect: players.map((num) => ({ id: Number(num) }))
				},
				actions: {
					create: actions.map((action) => ({
						type: action.type,
						time: Number(action.time),
						primaryPlayer: action.primaryPlayer
							? { connect: { id: Number(action.primaryPlayer) } }
							: undefined,
						secondaryPlayer: action.secondaryPlayer
							? { connect: { id: Number(action.secondaryPlayer) } }
							: undefined
					}))
				}
			}
		});
	},
	deletePoint: async ({ request }) => {
		const data = await request.formData();
		let pointId = data.get('pointId');
		await prisma.gamePoint.delete({
			where: { id: Number(pointId) }
		});
	}
};
