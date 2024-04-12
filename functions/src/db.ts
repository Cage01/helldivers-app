import { initializeApp } from "firebase/app";
import { addDoc, collection, collectionGroup, doc, DocumentReference, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
//import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
import { FCampaign, FGlobalEvent, FPlanetEvent, FProgress, FStats } from "./types/firebase_types";
import { Campaign, PlanetEvent } from "./types/api/helldivers/galaxy_status_types";
import { EventResult } from "./enums";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

export default class FirebaseInstance {

    public app = initializeApp(firebaseConfig)
    public db = getFirestore(this.app);

    constructor() { }

    async globalEventExists(eventID: number) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "GlobalEvents", eventID.toString()]);
        const docSnap = await getDoc(docRef);

        return docSnap.exists();
    }

    async getActiveGlobalEvents(): Promise<FGlobalEvent[]> {
        const q = query(collectionGroup(this.db, "GlobalEvents"),
            where("expires", ">=", new Date()),
            where("progress", "array-contains", EventResult.active));
        const snapshot = await getDocs(q)

        const globalEvents: FGlobalEvent[] = [];
        snapshot.forEach(element => {
            globalEvents.push(element.data() as FGlobalEvent)
        });

        return globalEvents
    }

    async createGlobalEvent(event: FGlobalEvent) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "GlobalEvents", event.id.toString()]);

        await setDoc(docRef, event)
            .then((data) => { console.log("GlobalEvent created") })
            .catch((err) => { console.error("Error creating GlobalEvent", err) })
    }

    async updateGlobalEvent(eventID: number, status: { progress: number[], updated: Date }) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "GlobalEvents", eventID.toString()]);

        await updateDoc(docRef, status)
            .then((data) => { console.log("GlobalEvent updated") })
            .catch((err) => { console.error("Error updating GlobalEvent", err) })
    }

    async campaignExists(campaign: Campaign) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString()]);
        const docSnap = await getDoc(docRef);

        return docSnap.exists();
    }

    async getActiveCampaigns(): Promise<FCampaign[]> {
        const q = query(collectionGroup(this.db, "Campaigns"), where("resultFlag", "==", EventResult.active));
        const snapshot = await getDocs(q)

        const campaigns: FCampaign[] = []
        snapshot.docs.forEach(element => {
            campaigns.push(element.data() as FCampaign)
        });

        return campaigns
    }

    async createCampaign(campaign: FCampaign) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString()]);
        await setDoc(docRef, campaign)
            .then((data) => { console.log("Campaign created") })
            .catch((err) => { console.error("Error creating Campaign", err) })
    }

    async updateCampaign(campaign: FCampaign | { id: number, planetIndex: number }, status: { updated: Date, resultFlag: EventResult }) {

        let campaignID = campaign.id
        let planetIndex = campaign.planetIndex;

        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", planetIndex.toString(), "Campaigns", campaignID.toString()]);
        await updateDoc(docRef, status)
            .then((data) => { console.log("Campaign updated") })
            .catch((err) => { console.error("Error updating Campaign", err) })
    }


    async planetEventExists(event: PlanetEvent) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", event.planetIndex.toString(), "Events", event.id.toString()]);
        const docSnap = await getDoc(docRef);

        return docSnap.exists();
    }

    async createPlanetEvent(event: FPlanetEvent) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", event.planetIndex.toString(), "Events", event.id.toString()]);
        await setDoc(docRef, event)
            .then((data) => { console.log("PlanetEvent created") })
            .catch((err) => { console.error("Error creating PlanetEvent", err) })
    }

    async updatePlanetEvent(eventID: number, planetIndex: number, status: { updated: Date, resultFlag: EventResult }) {
        const docRef = doc(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", planetIndex.toString(), "Events", eventID.toString()]);
        await updateDoc(docRef, status)
            .then((data) => { console.log("PlanetEvent updated") })
            .catch((err) => { console.error("Error updating PlanetEvent", err) })
    }

    async addGalaxyStatsDoc(stats: FStats) {
        await addDoc(collection(this.db, "HelldiversDB", ...["WarSeason_801", "GalaxyStats"]), stats)
            .then((data: DocumentReference) => { console.log("GalaxyStats document added ", data.path) })
            .catch((err) => { console.error("Error adding GalaxyStats document", err) })
    }

    async addProgressDoc(campaign: Campaign, progress: FProgress) {
        //Create new collection inside of campaign document - gets added with random ID under the campaign ID document
        await addDoc(collection(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", campaign.planetIndex.toString(), "Campaigns", campaign.id.toString(), "progress"]), progress)
            .then((data: DocumentReference) => { console.log("CampaignProgress document added ", data.path) })
            .catch((err) => { console.error("Error adding CampaignProgress document", err) })
    }
}