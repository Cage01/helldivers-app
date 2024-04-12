//TODO: consider making these interfaces for easy passing between client and server
export type GalaxyStatus = {
    warId:                       number;
    time:                        number;
    impactMultiplier:            number;
    storyBeatId32:               number;
    planetStatus:                PlanetStatus[];
    planetAttacks:               PlanetAttack[];
    campaigns:                   Campaign[];
    communityTargets:            any[]; //Unknown
    jointOperations:             JointOperation[];
    planetEvents:                PlanetEvent[];
    planetActiveEffects:         any[]; //Unknown
    activeElectionPolicyEffects: any[]; //Unknown
    globalEvents:                GlobalEvent[];
    superEarthWarResults:        any[]; //Unknown
}

export type Campaign = {
    id:          number;
    planetIndex: number;
    type:        number;
    count:       number;
}

export type GlobalEvent = {
    eventId:        number;
    id32:           number;
    portraitId32:   number;
    title:          string;
    titleId32:      number;
    message:        string;
    messageId32:    number;
    race:           number;
    flag:           number;
    assignmentId32: number;
    effectIds:      any[]; //Unknown
    planetIndices:  any[]; //Unknown
}

export type JointOperation = {
    id:          number;
    planetIndex: number;
    hqNodeIndex: number;
}

export type PlanetAttack = {
    source: number;
    target: number;
}

export type PlanetEvent = {
    id:                number;
    planetIndex:       number;
    eventType:         number;
    race:              number;
    health:            number;
    maxHealth:         number;
    startTime:         number;
    expireTime:        number;
    campaignId:        number;
    jointOperationIds: number[];
}

export type PlanetStatus = {
    index:          number;
    owner:          number;
    health:         number;
    regenPerSecond: number;
    players:        number;
}
