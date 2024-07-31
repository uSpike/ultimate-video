import prisma from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	const data = {
		tournaments: await prisma.tournament.findMany({})
	};
	return data;
};
