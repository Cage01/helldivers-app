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
    created: {seconds: number, nanoseconds: number};
    updated: {seconds: number, nanoseconds: number};
    completed: boolean;
    completedTitle: string;
    completedMessage: string
    eventId: number;
    title: string;
    message: string;
    race: number;
    flag: number;
    effectIds: number[]; //Unknown
    planetIndices: number[]; //Unknown
}