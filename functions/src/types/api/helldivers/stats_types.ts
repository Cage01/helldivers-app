export type RawStats = {
    galaxy_stats: StatsBlock,
    planets_stats: StatsBlock[]
}

type StatsBlock = {
    planetIndex:        number | undefined;
    accurracy:          number;
    automatonKills:     number;
    bugKills:           number;
    bulletsFired:       number;
    bulletsHit:         number;
    deaths:             number;
    friendlies:         number;
    illuminateKills:    number;
    missionSuccessRate: number;
    missionTime:        number;
    missionsLost:       number;
    missionsWon:        number;
    revives:            number;
    timePlayed:         number;
}