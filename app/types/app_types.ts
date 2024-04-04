import { GalaxyStatus } from "./api/helldivers/galaxy_status_types";
import { WarInfo } from "./api/helldivers/war_info_types";

export type PlanetsAPI = {
    id:      number;
    planet:  Planet;
    faction: Faction;
}

export type Planet = {
    index: number
    name:  string;
    image: string;
}

export type Faction = {
    name:  string;
    image: string;
}

export type StatusAPI = {
    info:              WarInfo;
    status:            GalaxyStatus;
    campaignWaypoints: CampaignWaypoint[];
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