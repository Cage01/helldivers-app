import axios from "axios";
import moment from 'moment';
import { GalaxyStatus } from "./types/api/helldivers/galaxy_status_types";
import { RawStats } from "./types/api/helldivers/stats_types";
import { WarInfo } from "./types/api/helldivers/war_info_types";
import { FProgress } from "./types/firebase_types";
import { MajorOrderType } from "./enums";
import { Assignment, Task } from "./types/api/helldivers/assignment_types";


export async function serverTimeToDate(time: number) {
    const urlTime: string = 'https://api.live.prod.thehelldiversgame.com/api/WarSeason/801/WarTime';

    const req= await axios.get(urlTime, { headers: { "Accept-Language": "en-US,en;q=0.5", "User-Agent": "Cage - helldivers.news (Archiver)" } });
    const serverTime  = req.data.time

    let delta = serverTime - time;

    return moment().subtract(delta, 'seconds').toDate();
}


export function buildCampaignProgress(planetIndex: number, info: WarInfo, status: GalaxyStatus, warStats: RawStats): FProgress {
    let res: FProgress = {} as FProgress

    let campaignID = status.campaigns.find(c => c.planetIndex == planetIndex)?.id
    res.campaignId = (campaignID != undefined) ? campaignID : -1

    let maxHealth = info.planetInfos.find(p => p.index == planetIndex)?.maxHealth
    res.maxHealth = (maxHealth != undefined) ? maxHealth : -1

    let stats = warStats.planets_stats.find(st => st.planetIndex == planetIndex);
    res.automatonKills = (stats != undefined) ? stats.automatonKills : -1
    res.missionsWon = (stats != undefined) ? stats.missionsWon : -1
    res.missionsLost = (stats != undefined) ? stats.missionsLost : -1
    res.bugKills = (stats != undefined) ? stats.bugKills : -1
    res.illuminateKills = (stats != undefined) ? stats.illuminateKills : -1
    res.bulletsFired = (stats != undefined) ? stats.bulletsFired : -1
    res.bulletsHit = (stats != undefined) ? stats.bulletsHit : -1
    res.timePlayed = (stats != undefined) ? stats.timePlayed : -1
    res.friendlyKills = (stats != undefined) ? stats.friendlies : -1
    res.deaths = (stats != undefined) ? stats.deaths : -1

    let planetStatus = status.planetStatus.find(ps => ps.index == planetIndex);
    res.health = (planetStatus != undefined) ? planetStatus.health : -1;
    res.playerCount = (planetStatus != undefined) ? planetStatus.players : -1;
    res.regenRate = (planetStatus != undefined) ? planetStatus.regenPerSecond : -1;

    let planetEvents = status.planetEvents.find(pe => pe.planetIndex == planetIndex);
    res.health = (planetEvents != undefined) ? planetEvents.health : res.health;
    res.maxHealth = (planetEvents != undefined) ? planetEvents.maxHealth : res.maxHealth;
    res.eventID = (planetEvents != undefined) ? planetEvents.id : 0;
    
    res.created = new Date();

    return res
}


export function determineAssignmentType(assignment: { setting: { taskDescription: string; }; }) {
    let type = MajorOrderType.unknown;

    if (assignment.setting.taskDescription.split(" ")[0] == "Liberate") {
        type = MajorOrderType.liberate
    }
    else if (assignment.setting.taskDescription.includes("Designated planets must be under Super Earth control when order expires")) {
        type = MajorOrderType.control
    } else if (assignment.setting.taskDescription.toLowerCase().includes("defense") || assignment.setting.taskDescription.toLowerCase().includes("defend")) {
        type = MajorOrderType.defend
    }

    return type;
}

export function determineEnemyID(assignment: Assignment, status: GalaxyStatus, info: WarInfo) {
    let enemyID = 0;

    if (assignment.setting.overrideBrief.toLowerCase().includes("automaton")) {
        enemyID = 3
    } else if (assignment.setting.overrideBrief.toLowerCase().includes("terminid") || assignment.setting.overrideBrief.toLowerCase().includes("bug")) {
        enemyID = 2
    } else {
        for (let i = 0; i < assignment.setting.tasks.length; i++) {
            const task: Task = assignment.setting.tasks[i]
            const planetIndex = task.values[2]
            const event = status.planetEvents.find(pe => pe.planetIndex == planetIndex)

            if (event == undefined) {
                enemyID = (status.planetStatus[planetIndex].owner > 1) ? status.planetStatus[planetIndex].owner : info.planetInfos[planetIndex].initialOwner
            } else {
                enemyID = event.race;
            }

            return enemyID
        }
    }

    return enemyID
}