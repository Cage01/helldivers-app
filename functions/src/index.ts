
import axios from 'axios';
import moment from 'moment';
import { EventResult } from './enums'
import { Campaign, GalaxyStatus, PlanetEvent } from "./types/api/helldivers/galaxy_status_types";
import { WarInfo } from "./types/api/helldivers/war_info_types";
import { RawStats } from "./types/api/helldivers/stats_types";
import FirebaseInstance from "./db";
import { FCampaign, FGlobalEvent } from "./types/firebase_types";
import { buildCampaignProgress, determineAssignmentType, determineEnemyID, serverTimeToDate } from "./utils";
import { Assignment } from "./types/api/helldivers/assignment_types";
require("firebase-functions/logger/compat");


const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.scheduledFunctionCrontab = onSchedule("*/5 * * * *", async () => {
    // ...
    writeToDB();
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.debug(`scheduledFunctionCrontab function uses approximately ${Math.round(used * 100) / 100} MB`);
});


const httpHeaders = { "Accept-Language": "en-US,en;q=0.5", "User-Agent": "Cage - helldivers.news (Archiver)" }

export default async function writeToDB() {
    console.debug("Entered main")

    const urlStatus: string = 'https://api.live.prod.thehelldiversgame.com/api/WarSeason/801/Status';
    const urlInfo: string = 'https://api.live.prod.thehelldiversgame.com/api/WarSeason/801/WarInfo';
    const urlAssignment: string = 'https://api.live.prod.thehelldiversgame.com/api/v2/Assignment/War/801';
    const urlWarStats: string = 'https://api.diveharder.com/raw/planetStats';

    const firebase = new FirebaseInstance();
    const now = new Date();

    try {
        const resStatus = await axios.get(urlStatus, { headers: httpHeaders });
        const statusData: GalaxyStatus = resStatus.data

        const resInfo = await axios.get(urlInfo, { headers: httpHeaders });
        const infoData: WarInfo = resInfo.data;

        const resAssignment = await axios.get(urlAssignment, { headers: httpHeaders })
        const assignmentData: Assignment[] = resAssignment.data;

        const resWarStats = await axios.get(urlWarStats, { headers: httpHeaders })
        const warStatsData: RawStats = resWarStats.data;


        //Add current galaxy stats to DB
        await firebase.addGalaxyStatsDoc({ created: now, ...warStatsData.galaxy_stats })

        //Create and update campaign entries
        statusData.campaigns.forEach(async (campaign: Campaign) => {
            if (await firebase.campaignExists(campaign)) {
                console.debug("Found campaign")
                await firebase.addProgressDoc(campaign, buildCampaignProgress(campaign.planetIndex, infoData, statusData, warStatsData))
                await firebase.updateCampaign(campaign, { updated: now, resultFlag: EventResult.active })
            } else {
                const planetEvent: PlanetEvent | undefined = statusData.planetEvents.find(e => e.campaignId === campaign.id)

                await firebase.createCampaign({
                    ...campaign,
                    created: now,
                    eventId: (planetEvent != undefined) ? [planetEvent.id] : [],
                    hasEvent: (planetEvent != undefined),
                    resultFlag: EventResult.active,
                    updated: now
                })
            }

        });

        //Create and update planet event entries - Dont add progress docs here
        statusData.planetEvents.forEach(async (event: PlanetEvent) => {
            if (!(await firebase.planetEventExists(event))) {
                await firebase.createPlanetEvent({
                    ...event,
                    created: now,
                    expireDate: await serverTimeToDate(event.expireTime),
                    resultFlag: EventResult.active,
                    updated: now
                })
            }
        });


        //Create and update global events/major orders
        assignmentData.forEach(async (element: Assignment) => {
            if (await firebase.globalEventExists(element.id32)) {
                console.debug("Found global event")
                await firebase.updateGlobalEvent(element.id32, { progress: element.progress, updated: now })
            } else {
                let expiration = moment().add(element.expiresIn, "seconds").toDate();
                console.debug("Creating Global Event")
                
                await firebase.createGlobalEvent({
                    progress: element.progress,
                    determinedType: determineAssignmentType(element),
                    enemyID: determineEnemyID(element, statusData, infoData),
                    expires: expiration,
                    id: element.id32,
                    taskDescription: element.setting.taskDescription,
                    flags: element.setting.flags,
                    overrideTitle: element.setting.overrideTitle,
                    reward: element.setting.reward,
                    type: element.setting.type,
                    overrideBrief: element.setting.overrideBrief,
                    tasks: element.setting.tasks,
                    created: now,
                    updated: now
                })
            }

        });

        await validateCampaignProgress(firebase, statusData)

        await validateGlobalEventProgress(firebase, assignmentData);


    } catch (exception) {
        console.error("Process could not finish error encountered", exception)
    }
}

//Compare dbActiveCampaigns to the list of Campaigns from the API
//Update the instances where an ID exists in the DB but not the API
//In those instances, planets where the owner >= 1 == EventResult.success
//Otherwise EventResult.failure
async function validateCampaignProgress(firebase: FirebaseInstance, statusData: GalaxyStatus) {
    console.debug("Entered validateCampaignProgress")

    const now = new Date();

    const dbActiveCampaigns = await firebase.getActiveCampaigns();

    const finishedCampaigns: FCampaign[] = [];
    dbActiveCampaigns.forEach(element => {
        const foundCampaign = statusData.campaigns.find(c => c.id == element.id)

        //if the campaignID is not found in the API then is must be finished
        if (foundCampaign == undefined) {
            finishedCampaigns.push(element)
        }
    });

    //for each of the finished campaigns see which faction owns the planet
    finishedCampaigns.forEach(async element => {
        let result: EventResult;
        if (statusData.planetStatus[element.planetIndex].owner <= 1) {
            result = EventResult.success
        } else {
            result = EventResult.failure
        }

        //Updating campaign entry
        firebase.updateCampaign(element, {updated: now, resultFlag: result})
        
        //Update event entries
        if (element.hasEvent) {
            element.eventId.forEach(async event => {
                firebase.updatePlanetEvent(event, element.planetIndex, {updated: now, resultFlag: result})
            });
        }
    });
}

async function validateGlobalEventProgress(firebase: FirebaseInstance, assignmentData: Assignment[]) {
    console.debug("Entered validateGlobalEventProgress")
    const now = new Date();

    //Check DB for active global events 
    //If the API has no entries, but there are active events or ID is different. Mark event as success
    const dbActiveGlobalEvents = await firebase.getActiveGlobalEvents();
    if (assignmentData.length == 0) {
        dbActiveGlobalEvents.forEach(async element => {
            const progress: number[] = []
            for (let i = 0; i < element.progress.length; i++) {
                progress.push(1)
            }
            firebase.updateGlobalEvent(element.id, { updated: now, progress: progress })
        });
    } else {
        const finishedEvents: FGlobalEvent[] = []
        dbActiveGlobalEvents.forEach(element => {
            const foundEvent = assignmentData.find(a => a.id32 == element.id);

            //Cant find event in current API results - so it must have completed successfully
            if (foundEvent == undefined) {
                finishedEvents.push(element)
            }
        });

        finishedEvents.forEach(async element => {
            const progress: number[] = []
            for (let i = 0; i < element.progress.length; i++) {
                progress.push(1)
            }
            firebase.updateGlobalEvent(element.id, { updated: now, progress: progress })
        });
    }
}