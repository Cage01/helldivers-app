//TODO: consider making these interfaces for easy passing between client and server
export type WarInfo = {
    warId:                  number;
    startDate:              number;
    endDate:                number;
    minimumClientVersion:   string;
    planetInfos:            PlanetInfo[];
    homeWorlds:             HomeWorld[];
    capitalInfos:           any[]; //Unknown
    planetPermanentEffects: any[]; //Unknown
}

export type HomeWorld = {
    race:          number;
    planetIndices: number[];
}

export type PlanetInfo = {
    index:        number;
    settingsHash: number;
    position:     Position;
    waypoints:    number[];
    sector:       number;
    maxHealth:    number;
    disabled:     boolean;
    initialOwner: number;
}

export type Position = {
    x: number;
    y: number;
}