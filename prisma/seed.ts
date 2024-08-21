// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

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

async function getNoteId(name: string, type: string) {
    const note = await prisma.gamePointActionNoteType.findFirst({
        where: {
            name: name,
            type: {
                type: type,
            },
        },
    });
    if (!note) {
        throw new Error(`Note ${name} for type ${type} not found`);
    }
    return note.id;
}

async function main() {
    console.log(`Start seeding ...`);

    const actionTypes = {
        Completion: await prisma.gamePointActionType.create({
            data: {
                type: 'Completion',
                description: 'A pass that is caught',
                requirePrimaryPlayer: 'true',
                primaryPlayerLabel: 'Thrower',
                requireSecondaryPlayer: 'true',
                secondaryPlayerLabel: 'Receiver',
                requireState: 'offense',
            },
        }),
        Turnover: await prisma.gamePointActionType.create({
            data: {
                type: 'Turnover',
                description: 'A turnover',
                requirePrimaryPlayer: 'true',
                primaryPlayerLabel: 'Thrower',
                requireSecondaryPlayer: 'optional',
                secondaryPlayerLabel: 'Receiver',
                requireState: 'offense',
            },
        }),
        Goal: await prisma.gamePointActionType.create({
            data: {
                type: 'Goal',
                description: 'A goal is scored.  If no secondary player is specified, it is a callahan.',
                requirePrimaryPlayer: 'true',
                primaryPlayerLabel: 'Thrower',
                requireSecondaryPlayer: 'optional',
                secondaryPlayerLabel: 'Receiver',
                requireState: 'offense',
            },
        }),
        Defended: await prisma.gamePointActionType.create({
            data: {
                type: 'Defended',
                description: 'A turnover for the opposing team',
                requirePrimaryPlayer: 'optional',
                primaryPlayerLabel: 'Defender',
                requireSecondaryPlayer: 'false',
                requireState: 'defense',
            },
        }),
        Conceded: await prisma.gamePointActionType.create({
            data: {
                type: 'Conceded',
                description: 'The point is conceded',
                requirePrimaryPlayer: 'false',
                requireSecondaryPlayer: 'false',
                requireState: 'defense',
            },
        }),
        Injury: await prisma.gamePointActionType.create({
            data: {
                type: 'Injury',
                description: 'An injury resulting in a substitution',
                requirePrimaryPlayer: 'true',
                primaryPlayerLabel: 'Injured',
                requireSecondaryPlayer: 'true',
                secondaryPlayerLabel: 'Substitute',
                requireState: 'any',
            },
        }),
        'Offense Set': await prisma.gamePointActionType.create({
            data: {
                type: 'Offense Set',
                description: 'A set offensive play is run',
                requirePrimaryPlayer: 'false',
                requireSecondaryPlayer: 'false',
                requireState: 'any',
            },
        }),
        'Defense Set': await prisma.gamePointActionType.create({
            data: {
                type: 'Defense Set',
                description: 'A set defensive play is run',
                requirePrimaryPlayer: 'false',
                requireSecondaryPlayer: 'false',
                requireState: 'any',
            },
        }),
    };

    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'under',
            description: 'Throw completed to the under space',
            type: { connect: { id: actionTypes['Completion'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'skinny',
            description: 'Throw completed to the skinny space',
            type: { connect: { id: actionTypes['Completion'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'strike',
            description: 'Throw completed to the strike space',
            type: { connect: { id: actionTypes['Completion'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'swing',
            description: 'Throw completed to the swing space',
            type: { connect: { id: actionTypes['Completion'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'huck',
            description: 'Throw completed to the huck space',
            type: { connect: { id: actionTypes['Completion'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'dump',
            description: 'Throw completed to the dump space',
            type: { connect: { id: actionTypes['Completion'].id } },
        },
    });

    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'drop',
            description: 'The thrower dropped the disc',
            type: { connect: { id: actionTypes['Turnover'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'throw',
            description: 'The thrower threw the disc away',
            type: { connect: { id: actionTypes['Turnover'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'stall',
            description: 'The player was stalled',
            type: { connect: { id: actionTypes['Turnover'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'catch',
            description: 'The receiver should have caught the disc',
            type: { connect: { id: actionTypes['Turnover'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'miscommunication',
            description: 'A miscommunication between players',
            type: { connect: { id: actionTypes['Turnover'].id } },
        },
    });

    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'endzone',
            description: 'The throw was caught in the endzone',
            type: { connect: { id: actionTypes['Goal'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'huck',
            description: 'The throw was a huck',
            type: { connect: { id: actionTypes['Goal'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'flow',
            description: 'The point was scored with flow',
            type: { connect: { id: actionTypes['Goal'].id } },
        },
    });

    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'block',
            description: 'The player blocked the disc',
            type: { connect: { id: actionTypes['Defended'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'poach',
            description: 'The player poached and got a D',
            type: { connect: { id: actionTypes['Defended'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'mark',
            description: 'The player got a D on the mark',
            type: { connect: { id: actionTypes['Defended'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'throw',
            description: 'The thrower threw the disc away',
            type: { connect: { id: actionTypes['Defended'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'drop',
            description: 'The receiver dropped the disc',
            type: { connect: { id: actionTypes['Defended'].id } },
        },
    });

    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'endzone',
            description: 'The point was scored in the endzone',
            type: { connect: { id: actionTypes['Conceded'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'huck',
            description: 'The point was scored with a huck',
            type: { connect: { id: actionTypes['Conceded'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'flow',
            description: 'The point was scored with flow',
            type: { connect: { id: actionTypes['Conceded'].id } },
        },
    });

    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'hex',
            description: 'Hex offense',
            type: { connect: { id: actionTypes['Offense Set'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'horizontal',
            description: 'horizontal stack offense',
            type: { connect: { id: actionTypes['Offense Set'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'vertical',
            description: 'Vertical stack offense',
            type: { connect: { id: actionTypes['Offense Set'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'person',
            description: 'Person defense',
            type: { connect: { id: actionTypes['Defense Set'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'zone-3-3-1',
            description: '3-3-1 Zone defense',
            type: { connect: { id: actionTypes['Defense Set'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'zone-2-4-1',
            description: '2-4-1 Zone defense',
            type: { connect: { id: actionTypes['Defense Set'].id } },
        },
    });
    await prisma.gamePointActionNoteType.create({
        data: {
            name: 'zone-2-3-2',
            description: '2-3-2 Zone defense',
            type: { connect: { id: actionTypes['Defense Set'].id } },
        },
    });

    let players = {};
    for (let t of roster) {
        const player = await prisma.player.create({
            data: {
                name: t[0],
                genderMatch: t[1],
            },
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
        players['Zach Hallum'],
    ];

    const heavyweights_tournament = await prisma.tournament.create({
        data: {
            name: 'Heavyweights 2024',
            players: {
                connect: heavyweights_players.map((id) => ({ id: id })),
            },
        },
    });

    const swiss_tournament = await prisma.tournament.create({
        data: {
            name: 'Swiss 2024',
            players: {},
        },
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
                        { id: players['James Rosenberger'] },
                    ],
                },
            },
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
                    ],
                },
            },
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
                        { id: players['Zach Hallum'] },
                    ],
                },
            },
        }),
    };

    const heavyweights_games = {
        jabba: await prisma.game.create({
            data: {
                date: new Date('2024-07-06'),
                opponent: 'Jabba',
                videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game1.mp4',
                tournamentId: heavyweights_tournament.id,
            },
        }),
        'queen city': await prisma.game.create({
            data: {
                date: new Date('2024-07-06'),
                opponent: 'Queen City',
                videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game2.mp4',
                tournamentId: heavyweights_tournament.id,
            },
        }),
        pixel: await prisma.game.create({
            data: {
                date: new Date('2024-07-06'),
                opponent: 'Pixel',
                videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game3.mp4',
                tournamentId: heavyweights_tournament.id,
            },
        }),
        pbhg: await prisma.game.create({
            data: {
                date: new Date('2024-07-06'),
                opponent: 'PBHG',
                videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game4.mp4',
                tournamentId: heavyweights_tournament.id,
            },
        }),
        stackcats: await prisma.game.create({
            data: {
                date: new Date('2024-07-07'),
                opponent: 'Stackcats',
                videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game5.mp4',
                tournamentId: heavyweights_tournament.id,
            },
        }),
        truc: await prisma.game.create({
            data: {
                date: new Date('2024-07-07'),
                opponent: 'TRUC',
                videoFile: 'https://mu2video.nyc3.cdn.digitaloceanspaces.com/2024-heavyweights-game6.mp4',
                tournamentId: heavyweights_tournament.id,
            },
        }),
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
                    { id: players['Zach Hallum'] },
                ],
            },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 96,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p1.id } },
            primaryPlayer: { connect: { id: players['Zach Hallum'] } },
            secondaryPlayer: { connect: { id: players['Maggie Lincoln'] } },
            notes: { connect: { id: await getNoteId('skinny', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });
    await prisma.gamePointAction.create({
        data: {
            time: 98,
            type: { connect: { id: actionTypes['Turnover'].id } },
            point: { connect: { id: g1p1.id } },
            primaryPlayer: { connect: { id: players['Maggie Lincoln'] } },
            notes: { connect: { id: await getNoteId('throw', 'Turnover') } },
        },
    });
    await prisma.gamePointAction.create({
        data: {
            time: 137,
            type: { connect: { id: actionTypes['Conceded'].id } },
            point: { connect: { id: g1p1.id } },
            notes: { connect: { id: await getNoteId('endzone', 'Conceded') } },
            offenseDefense: 'Defense',
        },
    });

    await prisma.gamePoint.update({
        where: { id: g1p1.id },
        data: {
            endTime: 137,
        },
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
                    { id: players['Lionel Wu'] },
                ],
            },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 238,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Luke Bodnar'] } },
            secondaryPlayer: { connect: { id: players['Lionel Wu'] } },
            notes: { connect: { id: await getNoteId('skinny', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 240,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Lionel Wu'] } },
            secondaryPlayer: { connect: { id: players['Kaylin Weber'] } },
            notes: { connect: { id: await getNoteId('under', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 248,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Kaylin Weber'] } },
            secondaryPlayer: { connect: { id: players['Andrew Taber'] } },
            notes: { connect: { id: await getNoteId('huck', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 252,
            type: { connect: { id: actionTypes['Turnover'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Andrew Taber'] } },
            notes: { connect: { id: await getNoteId('throw', 'Turnover') } },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 269,
            type: { connect: { id: actionTypes['Defended'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Kaylin Weber'] } },
            notes: { connect: { id: await getNoteId('block', 'Defended') } },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 277,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Lionel Wu'] } },
            secondaryPlayer: { connect: { id: players['Luke Bodnar'] } },
            notes: { connect: { id: await getNoteId('skinny', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 280,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Luke Bodnar'] } },
            secondaryPlayer: { connect: { id: players['Abby Seltzer'] } },
            notes: { connect: { id: await getNoteId('huck', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 284,
            type: { connect: { id: actionTypes['Completion'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Abby Seltzer'] } },
            secondaryPlayer: { connect: { id: players['Luke Bodnar'] } },
            notes: { connect: { id: await getNoteId('swing', 'Completion') } },
            offenseDefense: 'Offense',
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 292,
            type: { connect: { id: actionTypes['Turnover'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Luke Bodnar'] } },
            notes: { connect: { id: await getNoteId('throw', 'Turnover') } },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 354,
            type: { connect: { id: actionTypes['Defended'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Andrew Taber'] } },
            notes: { connect: { id: await getNoteId('block', 'Defended') } },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 369,
            type: { connect: { id: actionTypes['Turnover'].id } },
            point: { connect: { id: g1p2.id } },
            primaryPlayer: { connect: { id: players['Andrew Taber'] } },
            notes: { connect: { id: await getNoteId('throw', 'Turnover') } },
        },
    });

    await prisma.gamePointAction.create({
        data: {
            time: 395,
            type: { connect: { id: actionTypes['Conceded'].id } },
            point: { connect: { id: g1p2.id } },
            notes: { connect: { id: await getNoteId('endzone', 'Conceded') } },
        },
    });
    await prisma.gamePoint.update({
        where: { id: g1p2.id },
        data: {
            endTime: 395,
        },
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
