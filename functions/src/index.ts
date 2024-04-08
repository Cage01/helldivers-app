import { initializeApp } from "firebase/app";
import { addDoc, collection, collectionGroup, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
//import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import axios from 'axios';
import * as dotenv from 'dotenv';
import moment from 'moment';

dotenv.config();

enum Results {
    active = 0,
    success = 1,
    failure = 2
}

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app);


async function writeToDB() {
    const urlStatus: string = 'https://api.live.prod.thehelldiversgame.com/api/WarSeason/801/Status';
    const urlInfo: string = 'https://api.live.prod.thehelldiversgame.com/api/WarSeason/801/WarInfo';
    const urlAssignment: string = 'https://api.live.prod.thehelldiversgame.com/api/v2/Assignment/War/801';
    const urlWarStats: string = 'https://api.diveharder.com/raw/planetStats';

    try {
        const resStatus = await axios.get(urlStatus, { headers: { "Accept-Language": "en-US,en;q=0.5" } });
        const statusData = resStatus.data

        const resInfo = await axios.get(urlInfo, { headers: { "Accept-Language": "en-US,en;q=0.5" } });
        const infoData = resInfo.data;

        const resAssignment = await axios.get(urlAssignment, { headers: { "Accept-Language": "en-US,en;q=0.5" } })
        const assignmentData = resAssignment.data;

        const resWarStats = await axios.get(urlWarStats, { headers: { "Accept-Language": "en-US,en;q=0.5" } })
        const warStatsData = resWarStats.data;


        //TODO
        /*
        * Loop through all planets in War Info, and compare to active campaigns in both DB and API res. set active = false 
        * Potentially clear out progress collection for inactive campaigns and events
        * 
        */
        await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "GalaxyStats"]), {
            created: new Date(),
            ...warStatsData.galaxy_stats
        })

        statusData.campaigns.forEach(async (campaign: { id: { toString: () => any; }; planetIndex: number; type: any; count: any; }) => {
            const docRef = doc(db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString()]);
            const docSnap = await getDoc(docRef);


            const now = new Date();
            var planetData = buildPlanetData(campaign.planetIndex, infoData, statusData, warStatsData.planets_stats);

            if (docSnap.exists()) {
                const data = docSnap.data();

                //Update the count (CampaignID's dont seem up change on a planet, but the count increments instead)
                if (data.count != campaign.count) {
                    await updateDoc(docRef, {
                        count: campaign.count
                    })
                }

                //Create new collection inside of campaign document - gets added with random ID under the campaign ID document
                await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString(), "progress"]), {
                    parentID: campaign.id,
                    campaignCount: campaign.count,
                    created: now,
                    ...planetData
                })


                if (data.hasEvent) {
                    //Check API results
                    var ids: number[] = data.eventId
                    statusData.planetEvents.forEach((element: { id: number; }) => {
                        for (var i = 0; i < ids.length; i++) {
                            if (ids[i] == element.id) {
                                ids.splice(i, 1); //remove element from array
                            }
                        }
                    });

                    //Update PlanetEvent collection
                    if (ids.length > 0) {
                        ids.forEach(async element => {
                            const peRef = doc(db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Events", element.toString()]);
                            const peSnap = await getDoc(peRef);

                            if (peSnap.exists()) {
                                if (peSnap.data().resultFlag == Results.active) {
                                    await updateDoc(peRef, {
                                        ended: now,
                                        resultFlag: Results.failure // Failure
                                    })
                                }
                            }
                        });
                    }
                }

                if (data.resultFlag != 0) {
                    //Update timestamp
                    await updateDoc(docRef, {
                        resultFlag: 0,
                        updated: now,
                    })
                } else {
                    await updateDoc(docRef, {
                        updated: now,
                    })
                }


            } else {

                //Create initial campaign doc
                await setDoc(docRef, {
                    created: now,
                    updated: now,
                    id: campaign.id,
                    planetIndex: campaign.planetIndex,
                    type: campaign.type,
                    count: campaign.count,
                    hasEvent: planetData.hasEvent,
                    eventId: [planetData.eventID],
                    resultFlag: 0
                })



                //Create new collection inside of campaign document
                await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString(), "progress"]), {
                    parentID: campaign.id,
                    created: now,
                    ...planetData
                })
            }
        });

        statusData.planetEvents.forEach(async (event: {
            campaignId: any; id: { toString: () => any; }; planetIndex: number; race: any; eventType: any; startTime: any; expireTime: any; jointOperationIds: any;
        }) => {
            const docRef = doc(db, "HelldiversDB", ...["WarSeason_801", "Planets", event.planetIndex.toString(), "Events", event.id.toString()]);
            const docSnap = await getDoc(docRef);

            const now = new Date();
            var planetData = buildPlanetData(event.planetIndex, infoData, statusData, warStatsData.planets_stats);

            if (docSnap.exists()) {
                //Create new collection inside of campaign document
                await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "Planets", event.planetIndex.toString(), "Events", event.id.toString(), "progress"]), {
                    parentID: event.id,
                    created: now,
                    ...planetData
                })

                //Update timestamp
                await updateDoc(docRef, {
                    updated: now,
                })

            } else {

                let campaignCount = 0;
                for (let i = 0; i < statusData.campaigns; i++) {
                    if (statusData.campaigns[i].id == event.campaignId) {
                        campaignCount = statusData.campaigns[i].count;
                    }
                }

                //Create initial planet event doc
                await setDoc(docRef, {
                    created: now,
                    updated: now,
                    id: event.id,
                    planetIndex: event.planetIndex,
                    campaignId: planetData.campaignId,
                    campaignCount: campaignCount,
                    race: event.race,
                    eventType: event.eventType,
                    startTime: event.startTime,
                    expireTime: event.expireTime,
                    jointOperationIds: event.jointOperationIds,
                    resultFlag: Results.active, // 0 = Undefined | 1 = Success | 2 = Failure
                })


                //Create new collection inside of planet event document
                await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "Planets", event.planetIndex.toString(), "Events", event.id.toString(), "progress"]), {
                    parentID: event.id,
                    created: now,
                    ...planetData
                })
            }




        });



        assignmentData.forEach(async (element: any) => {
            const docRef = doc(db, "HelldiversDB", ...["WarSeason_801", "GlobalEvents", element.id32.toString()]);
            const docSnap = await getDoc(docRef);


            if (!docSnap.exists()) {
                let expiration = moment().add(element.expiresIn, "seconds").toDate();
                await setDoc(docRef, {
                    id: element.id32,
                    expires: expiration,
                    progress: element.progress,
                    created: new Date(),
                    updated: new Date(),
                    ...element.setting
                })
            } else {
                await updateDoc(docRef, {
                    progress: element.progress,
                    updated: new Date()
                })
            }

        });

        checkDBGlobalEvent(assignmentData)
        checkDBCompare(statusData)

        // eventSnapshot.docs.forEach(element => {
        //     activeEvents.push(element.data)
        //     //console.log(element.data())
        // });

        //await setDoc(doc(db, "GlobalEvents", "Briefings"), );
    } catch (exception) {
        process.stderr.write(`ERROR: ${exception}\n`);
    }
}

function buildPlanetData(index: number, info: any, status: any, warStats: any) {
    let res = {
        health: 0,
        maxHealth: 0,
        playerCount: 0,
        regenRate: 0,
        campaignId: 0,
        hasEvent: false,
        eventID: 0,
        missionsWon: 0,
        missionsLost: 0,
        bugKills: 0,
        automatonKills: 0,
        illuminateKills: 0,
        bulletsHit: 0,
        bulletsFired: 0,
        deaths: 0,
        friendlyKills: 0,
        timePlayed: 0,
        impactMultiplier: status.impactMultiplier,
    }

    status.campaigns.forEach((element: { planetIndex: number; id: number; }) => {
        if (element.planetIndex == index) {
            res.campaignId = element.id
        }
    })

    info.planetInfos.forEach((element: { index: number; maxHealth: number; }) => {
        if (element.index == index) {
            res.maxHealth = element.maxHealth;
        }
    });

    warStats.forEach((element: { planetIndex: number; missionsWon: number; missionsLost: number; bugKills: number; automatonKills: number; illuminateKills: number; bulletsFired: number; bulletsHit: number; timePlayed: number; friendlies: number; deaths: number; }) => {
        if (element.planetIndex == index) {
            res.missionsWon = element.missionsWon;
            res.missionsLost = element.missionsLost;
            res.bugKills = element.bugKills;
            res.automatonKills = element.automatonKills;
            res.illuminateKills = element.illuminateKills;
            res.bulletsFired = element.bulletsFired;
            res.bulletsHit = element.bulletsHit;
            res.timePlayed = element.timePlayed
            res.friendlyKills = element.friendlies;
            res.deaths = element.deaths;
        }
    });

    status.planetStatus.forEach((element: { index: number; health: number; players: number; regenPerSecond: number; }) => {
        if (element.index == index) {
            res.health = element.health;
            res.playerCount = element.players
            res.regenRate = element.regenPerSecond;
        }
    });

    //This one is last because health values may change in the instance of there being an event on the planet
    status.planetEvents.forEach((element: { planetIndex: number; health: number; maxHealth: number; id: number; }) => {
        if (element.planetIndex == index) {
            res.health = element.health;
            res.maxHealth = element.maxHealth;
            res.hasEvent = true;
            res.eventID = element.id;
        }
    });

    return res
}

async function checkDBCompare(statusData: any) {
    const q = query(collectionGroup(db, "Campaigns"), where("resultFlag", "==", Results.active));
    const qe = query(collectionGroup(db, "Events"), where("resultFlag", "==", Results.active));

    const campaignSnapshot = await getDocs(q);
    const eventSnapshot = await getDocs(qe);
    //console.log(campaignSnapshot.docs)

    const now = new Date();

    //Iterate through active campaigns in DB
    //Compare API response with each
    //If campaign isnt in API response, check planet owner in API status
    //If owner != 1 we lost, otherwise we won
    campaignSnapshot.docs.forEach(element => {
        let found: boolean = false;
        // for each active campaign in DB check if there is a corresponding campaign from the API
        statusData.campaigns.forEach(async (campaignAPI: any) => {
            if (campaignAPI.id == element.data().id) {
                found = true;
                return;
            }
        });

        //If there isnt
        if (!found) {
            //Check planet if the planet owner is != 1 (Humans)
            statusData.planetStatus.forEach(async (planet: { index: any; owner: number; }) => {
                if (planet.index == element.data().planetIndex) {
                    let type: string = (element.data().hasEvent) ? "Defense" : "Liberation"

                    //If the owner is Humans, campaign was a success
                    if (planet.owner == 1) {
                        await updateDoc(element.ref, {
                            updated: now,
                            resultFlag: Results.success,
                        })

                        console.log("Campaign ID: " + element.data().id.toString())
                        //"WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString(), "progress"
                        await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "Planets", "Campaigns", element.data().id.toString(), "history"]),
                            { created: now, type: type, result: "Success" })
                    } else {

                        //Otherwise campaign was a failure
                        await updateDoc(element.ref, {
                            updated: now,
                            resultFlag: Results.failure,
                        })

                        console.log("Campaign ID: " + element.data().id.toString())
                        await addDoc(collection(db, "HelldiversDB", ...["WarSeason_801", "Planets", "Campaigns", element.data().id.toString(), "history"]),
                            { created: now, type: type, result: "Failure", race: planet.owner })
                    }

                    return
                }
            });
        }
    });

    eventSnapshot.forEach(async element => {
        //for each active planet event, check if there is a corresponding event from the API
        let eventFound: boolean = false;
        statusData.planetEvents.forEach((event: { id: any; }) => {
            if (event.id == element.data().id) {
                eventFound = true
                return
            }
        });

        //if there isnt
        if (!eventFound) {
            //Check if the recorded campaign is active
            let campaignFound: any = null;
            statusData.campaigns.forEach((campaign: any) => {
                if (campaign.planetIndex == element.data().planetIndex) {
                    campaignFound = campaign;
                    return
                }
            });

            //If its active, and the campaign count is the same, we failed
            if (campaignFound != null) {
                //TODO: Potential edge case where an event in the future may not be marked as being completed, and looks at a campaign that is unrelated
                //if (campaignFound.count == element.data().count) {
                await updateDoc(element.ref, {
                    updated: now,
                    resultFlag: Results.failure
                })
                //}
            } else {
                await updateDoc(element.ref, {
                    updated: now,
                    resultFlag: Results.success
                })
            }
        }
    });
}

async function checkDBGlobalEvent(assignmentData: any[]) {
    const now = new Date();
    const q = query(collectionGroup(db, "GlobalEvents"), 
        where("expires", ">=", now), 
        where("progress", "array-contains", 0));

    const eventSnapshot = await getDocs(q);
    eventSnapshot.forEach(async element => {

        //Check API results. If no ID's match up, then update the progress
        const find = assignmentData.find(a => a.id32 == element.data().id)
        if (find == undefined) {
            const docRef = doc(db, "HelldiversDB", ...["WarSeason_801", "GlobalEvents", element.data().id.toString()]);

            let progress: number[] = []
            for (let i = 0; i < element.data().progress.length; i++) {
                progress.push(1)
            }
            //Update timestamp & progress
            await updateDoc(docRef, {
                updated: now,
                progress: progress,
            })
        }
    });
}

export default writeToDB;

//writeToDB();
const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.scheduledFunctionCrontab = onSchedule("*/5 * * * *", async () => {
    // ...
    writeToDB();
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`scheduledFunctionCrontab function uses approximately ${Math.round(used * 100) / 100} MB`);
});


