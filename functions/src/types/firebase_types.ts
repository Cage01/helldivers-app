import { MajorOrderType } from "../enums";
import { Reward, Task } from "./api/helldivers/assignment_types";


export type FGlobalEvent = {
    progress:        number[];
    determinedType:  MajorOrderType;
    enemyID:         number;
    expires:         FTimestamp | Date
    id:              number;
    taskDescription: string;
    flags:           number;
    overrideTitle:   string;
    reward:          Reward;
    type:            number;
    overrideBrief:   string;
    tasks:           Task[];
    created: FTimestamp | Date
    updated: FTimestamp | Date
}

export type FPlanetEvent = {
    campaignId:        number;
    created:           FTimestamp | Date;
    eventType:         number;
    expireDate:        FTimestamp | Date;
    expireTime:        number;
    id:                number;
    jointOperationIds: number[];
    planetIndex:       number;
    race:              number;
    resultFlag:        number;
    startTime:         number;
    updated:           FTimestamp | Date;
}

export type FProgress = {
    automatonKills:   number;
    bugKills:         number;
    bulletsFired:     number;
    bulletsHit:       number;
    campaignId:       number;
    created:          FTimestamp | Date;
    deaths:           number;
    eventID:          number;
    friendlyKills:    number;
    health:           number;
    illuminateKills:  number;
    impactMultiplier: number;
    maxHealth:        number;
    missionsLost:     number;
    missionsWon:      number;
    playerCount:      number;
    regenRate:        number;
    timePlayed:       number;
}

export type FCampaign = {
    count:       number;
    created:     FTimestamp | Date;
    eventId:     number[];
    hasEvent:    boolean;
    id:          number;
    planetIndex: number;
    resultFlag:  number;
    type:        number;
    updated:     FTimestamp | Date;
}

export type FStats = {
    accurracy:          number;
    automatonKills:     number;
    bugKills:           number;
    bulletsFired:       number;
    bulletsHit:         number;
    created:            FTimestamp | Date;
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
export type FTimestamp = {
    seconds: number,
    nanoseconds: number
}

