import { GalaxyStatus } from "./api/helldivers/galaxy_status_types";
import { WarInfo } from "./api/helldivers/war_info_types";
import { FProgress, FTimestamp } from "./firebase_types";

export type PlanetsAPI = {
    id:      number;
    planet:  {index: number, name: string, image: string};
    faction: {name: string, image: string};
}
export type StatusAPI = {
    info:              WarInfo;
    status:            GalaxyStatus;
    campaignWaypoints: CampaignWaypoint[];
}

export type HistoricalAPI = {
    campaignId: number,
    progress: FProgress[]
}

export type PlanetEventAPI = {
    planetName:        string;
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

export type CampaignWaypoint = {
    planetIndex: number;
    planetName:  string;
    campaignId:  number;
    waypoints:   number[];
}

export type AlertItem = {
    title: string,
    message: string,
    task: string | undefined,
    reward: {
        type: string,
        amount: number
    } | undefined
}