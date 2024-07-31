// import { error } from '@sveltejs/kit';
// import prisma from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const data = {
		test: { foo: 'bar' }
	};
	return data;
};

// 	if (!data.game) {
// 		error(404, 'Game not found');
// 	}
// 	return data;
// };
