import { Campaign } from "../types/api/helldivers/galaxy_status_types";
import fs from 'fs';
import path from "path";
import { SteamNews } from "../types/api/steam/steam_news_types";

const baseURL = "https://api.live.prod.thehelldiversgame.com/api/"

export async function queryWarTimeExternal() {
    try {
        const res = await fetch(baseURL + "WarSeason/801/WarTime", { next: { revalidate: 10 } });
        res.headers.append("Accept-Language", "en-US,en;q=0.5")

        return await res.json()
    } catch (error) {
        console.error(error)
    }

    return {};
}

export async function queryExternal() {
    try {
        const res_info = await fetch(baseURL + 'WarSeason/801/WarInfo', { next: { revalidate: 20 } });
        const warInfo = await res_info.json();

        const res_status = await fetch(baseURL + 'WarSeason/801/Status', { next: { revalidate: 20 } });
        const status = await res_status.json();

        let campaignWaypoints: { planetIndex: number, planetName: string, campaignId: number; waypoints: any; }[] = []
        status.campaigns.forEach((element: Campaign) => {
            campaignWaypoints.push({ planetIndex: element.planetIndex, planetName: getPlanetNameFromID(element.planetIndex), campaignId: element.id, waypoints: warInfo.planetInfos[element.planetIndex].waypoints })
        });

        return ({ info: warInfo, status: status, campaignWaypoints: campaignWaypoints })
    } catch (error) {
        console.error(error)
    }

    return {};
}

export async function queryNewsFeedExternal() {

    let time = (await queryWarTimeExternal()).time;
    time -= 172800 //1 day

    try {
        const res = await fetch(baseURL + 'NewsFeed/801?fromTimestamp=' + time, { next: { revalidate: 20 } });
        res.headers.append("Accept-Language", "en-US,en;q=0.5")
        return await res.json()
    } catch (error) {
        console.error(error)
    }

    return {};
}

export async function queryAssignmentExternal() {
    try {
        const res = await fetch(baseURL + "v2/Assignment/War/801", { next: { revalidate: 20 } });
        res.headers.append("Accept-Language", "en-US,en;q=0.5")

        return await res.json();
    } catch (error) {
        console.error(error)
    }

    return {};
}

export async function queryGalaxyStatsExternal() {
    try {
        const res = await fetch('https://api.diveharder.com/raw/planetStats', { next: { revalidate: 20 } })
        res.headers.append("Accept-Language", "en-US,en;q=0.5")

        return await res.json();
    } catch (error) {
        console.log("ERRORS")
        console.error(error)
    }

    return {}
}

export async function querySteamNews() {
    const res_steam_news = await fetch('https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=' + process.env.NEXT_PUBLIC_STEAM_APP_ID + "&count=500")
    const news: SteamNews = await res_steam_news.json();
}



export function getRandomPlanetImage() {
    const files: string[] = fs.readdirSync(path.join(process.cwd(), "public/images/planets"));
    return "/images/planets/" + files[Math.floor(Math.random() * files.length)];
}


export function getPlanetNameFromID(index: number): string {
    const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))

    return planets[index].name
}
