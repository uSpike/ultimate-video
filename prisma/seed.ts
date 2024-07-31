// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
//import userData from "../src/lib/data.json" assert { type: "json" }

const prisma = new PrismaClient();

const roster = [
	['Abby Seltzer', 'fmp'],
	['Amanda Strickland', 'fmp'],
	['Anna Wozniak', 'fmp'],
	['Carrie Juergens', 'fmp'],
	['Emma Cosby', 'fmp'],
	['Grace Bao', 'fmp'],
	['Kaylin Weber', 'fmp'],
	['Kylie Moynihan', 'fmp'],
	['Sarah Guenther', 'fmp'],
	['Theresa Olson', 'fmp'],
	['Maggie Lincoln', 'fmp'],
	['Greta Hippensteel', 'fmp'],
	['Megan Childers', 'fmp'],
	['Kyle Halstater', 'mmp'],
	['Andrew Taber', 'mmp'],
	['David Cann', 'mmp'],
	['James Rosenberger', 'mmp'],
	['Jeremy Wilson', 'mmp'],
	['Jordan Speicher', 'mmp'],
	['Keith McCarthy', 'mmp'],
	['Kevin Scopoline', 'mmp'],
	['Lionel Wu', 'mmp'],
	['Luke Bodnar', 'mmp'],
	['Maximilian Nytko', 'mmp'],
	['Patrick Kopp', 'mmp'],
	['Vikas Biliyar', 'mmp'],
	['Zach Hallum', 'mmp'],
];

async function main() {
	console.log(`Start seeding ...`);

	let players = {};
	for (let t of roster) {
		const player = await prisma.player.create({
			data: {
				name: t[0],
				genderMatch: t[1],
			}
		});
		players[t[0]] = player.id;
	}

	const heavyweights_players = [
		players['Abby Seltzer'],
		players['Amanda Strickland'],
		players['Anna Wozniak'],
		players['Grace Bao'],
		players['Kaylin Weber'],
		players['Kylie Moynihan'],
		players['Sarah Guenther'],
		players['Maggie Lincoln'],
		players['Megan Childers'],
		players['Kyle Halstater'],
		players['Andrew Taber'],
		players['David Cann'],
		players['James Rosenberger'],
		players['Jeremy Wilson'],
		players['Jordan Speicher'],
		players['Keith McCarthy'],
		players['Kevin Scopoline'],
		players['Lionel Wu'],
		players['Luke Bodnar'],
		players['Maximilian Nytko'],
		players['Patrick Kopp'],
		players['Zach Hallum']
	];

	const heavyweights_tournament = await prisma.tournament.create({
		data: {
			name: 'Heavyweights 2024',
			players: {
				connect: heavyweights_players.map((id) => ({ id: id }))
			}
		}
	});

	const swiss_tournament = await prisma.tournament.create({
		data: {
			name: 'Swiss 2024',
			players: {}
		}
	});

	prisma.playerLine.create({
		data: {
			name: 'Swiss test',
			tournamentId: swiss_tournament.id
		}
	});

	const heavyweights_lines = {
		rohan: await prisma.playerLine.create({
			data: {
				name: 'Rohan',
				tournamentId: heavyweights_tournament.id,
				primaryPlayers: {
					connect: [
						{ id: players['Megan Childers'] },
						{ id: players['Sarah Guenther'] },
						{ id: players['Abby Seltzer'] },
						{ id: players['Luke Bodnar'] },
						{ id: players['Andrew Taber'] },
						{ id: players['Lionel Wu'] },
						{ id: players['Kevin Scopoline'] },
						{ id: players['James Rosenberger'] }
					]
				}
			}
		}),
		mirkwood: await prisma.playerLine.create({
			data: {
				name: 'Mirkwood',
				tournamentId: heavyweights_tournament.id,
				primaryPlayers: {
					connect: [
						{ id: players['Amanda Strickland'] },
						{ id: players['Kylie Moynihan'] },
						{ id: players['Kaylin Weber'] },
						{ id: players['Jordan Speicher'] },
						{ id: players['Patrick Kopp'] },
						{ id: players['David Cann'] },
						{ id: players['Keith McCarthy'] },
					]
				}
			}
		}),
		'khazad-dum': await prisma.playerLine.create({
			data: {
				name: 'Khazad-dum',
				tournamentId: heavyweights_tournament.id,
				primaryPlayers: {
					connect: [
						{ id: players['Anna Wozniak'] },
						{ id: players['Grace Bao'] },
						{ id: players['Maggie Lincoln'] },
						{ id: players['Kyle Halstater'] },
						{ id: players['Jeremy Wilson'] },
						{ id: players['Maximilian Nytko'] },
						{ id: players['Zach Hallum'] }
					]
				}
			}
		})
	};

	const heavyweights_games = {
		jabba: await prisma.game.create({
			data: {
				date: new Date('2024-07-06'),
				opponent: 'Jabba',
				videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game1.mp4',
				tournamentId: heavyweights_tournament.id
			}
		}),
		'queen city': await prisma.game.create({
			data: {
				date: new Date('2024-07-06'),
				opponent: 'Queen City',
				videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game2.mp4',
				tournamentId: heavyweights_tournament.id
			}
		}),
		pixel: await prisma.game.create({
			data: {
				date: new Date('2024-07-06'),
				opponent: 'Pixel',
				videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game3.mp4',
				tournamentId: heavyweights_tournament.id
			}
		}),
		pbhg: await prisma.game.create({
			data: {
				date: new Date('2024-07-06'),
				opponent: 'PBHG',
				videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game4.mp4',
				tournamentId: heavyweights_tournament.id
			}
		}),
		stackcats: await prisma.game.create({
			data: {
				date: new Date('2024-07-07'),
				opponent: 'Stackcats',
				videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game5.mp4',
				tournamentId: heavyweights_tournament.id
			}
		}),
		truc: await prisma.game.create({
			data: {
				date: new Date('2024-07-07'),
				opponent: 'TRUC',
				videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game6.mp4',
				tournamentId: heavyweights_tournament.id
			}
		})
	};

	const g1p1 = await prisma.gamePoint.create({
		data: {
			gameId: heavyweights_games['jabba'].id,
			lineId: heavyweights_lines['khazad-dum'].id,
			startTime: 20,
			endTime: 137,
			offenseDefense: 'Defense',
			players: {
				connect: [
					{ id: players['Anna Wozniak'] },
					{ id: players['Grace Bao'] },
					{ id: players['Maggie Lincoln'] },
					{ id: players['Kyle Halstater'] },
					{ id: players['Jeremy Wilson'] },
					{ id: players['Maximilian Nytko'] },
					{ id: players['Zach Hallum'] }
				]
			}
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 96,
			type: 'Completion',
			pointId: g1p1.id,
			primaryPlayerId: players['Zach Hallum'],
			secondaryPlayerId: players['Maggie Lincoln']
		}
	});
	await prisma.gamePointAction.create({
		data: {
			time: 98,
			type: 'Turnover',
			pointId: g1p1.id,
			primaryPlayerId: players['Maggie Lincoln']
		}
	});
	await prisma.gamePointAction.create({
		data: {
			time: 137,
			type: 'Conceded',
			pointId: g1p1.id
		}
	});

	await prisma.gamePoint.update({
		where: { id: g1p1.id },
		data: {
			endTime: 137
		}
	});

	const g1p2 = await prisma.gamePoint.create({
		data: {
			gameId: heavyweights_games['jabba'].id,
			lineId: heavyweights_lines['rohan'].id,
			startTime: 231,
			endTime: 395,
			offenseDefense: 'Offense',
			players: {
				connect: [
					{ id: players['Megan Childers'] },
					{ id: players['Kaylin Weber'] },
					{ id: players['Sarah Guenther'] },
					{ id: players['Abby Seltzer'] },
					{ id: players['Luke Bodnar'] },
					{ id: players['Andrew Taber'] },
					{ id: players['Lionel Wu'] }
				]
			}
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 238,
			type: 'Completion',
			pointId: g1p2.id,
			primaryPlayerId: players['Luke Bodnar'],
			secondaryPlayerId: players['Lionel Wu']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 240,
			type: 'Completion',
			pointId: g1p2.id,
			primaryPlayerId: players['Lionel Wu'],
			secondaryPlayerId: players['Kaylin Weber']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 248,
			type: 'Completion',
			pointId: g1p2.id,
			primaryPlayerId: players['Kaylin Weber'],
			secondaryPlayerId: players['Andrew Taber']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 252,
			type: 'Turnover',
			pointId: g1p2.id,
			primaryPlayerId: players['Andrew Taber']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 269,
			type: 'Defended',
			pointId: g1p2.id,
			primaryPlayerId: players['Kaylin Weber']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 271,
			type: 'Defended',
			pointId: g1p2.id,
			primaryPlayerId: players['Megan Childers']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 277,
			type: 'Completion',
			pointId: g1p2.id,
			primaryPlayerId: players['Lionel Wu'],
			secondaryPlayerId: players['Luke Bodnar']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 280,
			type: 'Completion',
			pointId: g1p2.id,
			primaryPlayerId: players['Luke Bodnar'],
			secondaryPlayerId: players['Abby Seltzer']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 284,
			type: 'Completion',
			pointId: g1p2.id,
			primaryPlayerId: players['Abby Seltzer'],
			secondaryPlayerId: players['Luke Bodnar']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 292,
			type: 'Turnover',
			pointId: g1p2.id,
			primaryPlayerId: players['Luke Bodnar']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 354,
			type: 'Defended',
			pointId: g1p2.id,
			primaryPlayerId: players['Andrew Taber']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 369,
			type: 'Turnover',
			pointId: g1p2.id,
			primaryPlayerId: players['Andrew Taber']
		}
	});

	await prisma.gamePointAction.create({
		data: {
			time: 395,
			type: 'Conceded',
			pointId: g1p2.id
		}
	});
	await prisma.gamePoint.update({
		where: { id: g1p2.id },
		data: {
			endTime: 395
		}
	});

	console.log(`Seeding finished.`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		//process.exit(1)
	});
