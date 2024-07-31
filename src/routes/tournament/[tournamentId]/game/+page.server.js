import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
// export const load = async ({ params }) => {
// 	const data = {
// 		game: await prisma.game.findUnique({
// 			where: { id: Number(params.id) }
// 		}),
// 		points: await prisma.gamePoint.findMany({
// 			where: { gameId: Number(params.id) },
// 			include: {
// 				line: true,
// 				players: true,
// 				actions: true
// 			}
// 		})
// 	};

// 	if (!data.game) {
// 		error(404, 'Game not found');
// 	}
// 	return data;
// };

// /** @type {import('./$types').Actions} */
// export const actions = {
// 	default: async ({ request }) => {
// 		const data = await request.formData();
// 		console.log(data);

// 		let opponent = data.get('opponent');
// 		let date = data.get('date');
// 		let tournamentId = data.get('tournamentId');
// 		let videoFile = data.get('videoFile');

// 		let res = await prisma.game.create({
// 			data: {
// 				opponent,
// 				date: new Date(date),
// 				tournament: { connect: { id: Number(tournamentId) }},
// 				videoFile: videoFile,
// 			}
// 		});
// 		console.log(res);
// 	}
// };
