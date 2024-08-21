import { Prisma } from '@prisma/client';

export type Game = Prisma.GameGetPayload<{
    include: {
        points: {
            include: {
                players: true;
                actions: {
                    include: {
                        type: true;
                    };
                };
            };
        };
    };
}>;

export type Player = Prisma.PlayerGetPayload<{}>;
export type Line = Prisma.PlayerLineGetPayload<{
    include: {
        primaryPlayers: true;
    };
}>;

export const sumObjectsByKey = (...objs: any[]) => {
    const res = objs.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k)) {
                a[k] = (a[k] || 0) + b[k];
            }
        }
        return a;
    }, {});
    return res;
};

export function calculateStats(games: Array<Game>, gameId: Number | null, lineId: Number | null, playerId: Number) {
    let stats = {
        timePlayed: 0,
        pointsPlayed: 0,
        touchLook: 0,
        pointsWithTouchLook: 0,
        offenseTouches: 0,
        oPointsPlayed: 0,
        dPointsPlayed: 0,
        oPointsWon: 0,
        dPointsWon: 0,
        totalPointsWon: 0,
        oWinPct: 0,
        dWinPct: 0,
        pointWinPct: 0,
        possessions: 0,
        oPointsPossessions: 0,
        dPointsPossessions: 0,
        oEfficiency: 0,
        oPtEfficiencyPct: 0,
        dPtEfficiencyPct: 0,
        hockey: 0,
        assists: 0,
        goals: 0,
        plusMinus: 0,
        blocks: 0,
    };
    for (let game of games) {
        if (gameId != null && game.id != gameId) continue;

        for (let point of game.points) {
            if (lineId != null && point.lineId != lineId) continue;
            if (!point.players.find((p) => p.id === playerId)) continue;

            let didRecordTouchLookPoint = false;

            stats.timePlayed += point.endTime - point.startTime;
            stats.pointsPlayed++;

            if (point.offenseDefense == 'Offense') {
                stats.oPointsPlayed++;
            } else {
                stats.dPointsPlayed++;
            }

            for (let i = 0; i < point.actions.length; i++) {
                let action = point.actions[i];
                let lastAction = point.actions[i - 1];
                let isPP = action.primaryPlayerId == playerId;
                let isSP = action.secondaryPlayerId == playerId;

                switch (action.type.type) {
                    case 'Completion':
                        stats.touchLook++;
                        if (!didRecordTouchLookPoint) {
                            stats.pointsWithTouchLook++;
                            didRecordTouchLookPoint = true;
                        }
                        break;
                    case 'Turnover':
                        if (isSP) stats.touchLook++;
                        break;
                    case 'Defended':
                        if (isPP) {
                            stats.blocks++;
                        }
                        break;
                    case 'Goal':
                        stats.totalPointsWon++;
                        stats.plusMinus++;
                        if (isPP) stats.goals++;
                        if (isSP) stats.assists++;

                        if (lastAction?.type.type == 'Completion' && lastAction?.primaryPlayerId == playerId) {
                            stats.hockey++;
                        }
                        if (point.offenseDefense == 'Offense') {
                            stats.oPointsWon++;
                        } else {
                            stats.dPointsWon++;
                        }
                        break;
                    case 'Conceded':
                        stats.plusMinus--;
                        break;
                }
            }
        }
    }
    return stats;
}

export function getPlayerStats(players: Player[], games: Game[]) {
    return players.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>((acc, player) => {
        acc[player.id] = calculateStats(games, null, null, player.id);
        return acc;
    }, {});
}

export function getGenderStats(players: Player[], games: Game[]) {
    return players.reduce<{ [key: string]: ReturnType<typeof calculateStats> }>((acc, player) => {
        const playerStat = calculateStats(games, null, null, player.id);
        acc[player.genderMatch] = sumObjectsByKey(acc[player.genderMatch], playerStat);
        return acc;
    }, {});
}

export function getLineStats(lines: Line[], games: Game[]) {
    return lines.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>((acc, line) => {
        for (const player of line.primaryPlayers) {
            const playerStat = calculateStats(games, line.id, null, player.id);
            acc[line.id] = sumObjectsByKey(acc[line.id], playerStat);
        }
        return acc;
    }, {});
}
