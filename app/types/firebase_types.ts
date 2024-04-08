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
    expires:         {seconds: number, nanoseconds: number};
    id:              number;
    taskDescription: string;
    flags:           number;
    overrideTitle:   string;
    reward:          Reward;
    type:            number;
    overrideBrief:   string;
    tasks:           Task[];
    created: {seconds: number, nanoseconds: number};
    updated: {seconds: number, nanoseconds: number};
}

