import { MajorOrderType } from "../classes/enums";
import { Reward, Task } from "./api/helldivers/assignment_types";

export type FCampaignProgress = {
    impactMultiplier: number,
    health: number,
    created: number,
    regenRate: number,
    maxHealth: number,
    playerCount: number,
    parentID: number
}

export type FGlobalEvent = {
    progress:        number[];
    determinedType:  MajorOrderType;
    enemyID:         number;
    expires:         FTimestamp
    id:              number;
    taskDescription: string;
    flags:           number;
    overrideTitle:   string;
    reward:          Reward;
    type:            number;
    overrideBrief:   string;
    tasks:           Task[];
    created: FTimestamp
    updated: FTimestamp
}

export type FPlanetEvent = {
    campaignCount:     number;
    campaignId:        number;
    created:           FTimestamp;
    eventType:         number;
    expireDate:        FTimestamp;
    expireTime:        number;
    id:                number;
    jointOperationIds: number[];
    planetIndex:       number;
    race:              number;
    resultFlag:        number;
    startTime:         number;
    updated:           FTimestamp;
}

export type FTimestamp = {
    seconds: number,
    nanoseconds: number
}

