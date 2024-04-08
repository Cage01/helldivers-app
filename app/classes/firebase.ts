import { initializeApp } from "firebase/app";
import { getFirestore, query, collection, orderBy, getDocs, where, doc, getDoc, collectionGroup, and, limit, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { FCampaignProgress, FGlobalEvent } from "../types/firebase_types";




export default class FirebaseInstance {
    private firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    public app = initializeApp(this.firebaseConfig)
    public db = getFirestore(this.app);


    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    constructor() { }



    async geProgressData(planetID: number, campaignID: number, newerThan: Date) {
        const qProg = query(collection(this.db, "HelldiversDB", ...["WarSeason_801", "Planets", planetID.toString(), "Campaigns", campaignID.toString(), "progress"]),
            where("created", ">=", newerThan));

        const qsProg = await getDocs(qProg);

        let prog: FCampaignProgress[] = []
        // qsProg.forEach(async element => {
        //     prog = await element.data() as FirebaseCampaignProgress[];
        // });

        for (let i = 0; i < qsProg.docs.length; i++) {
            //console.log(qsProg.docs[i].data())
            let tmp = qsProg.docs[i].data()
            tmp.created = tmp.created.seconds;
            prog.push(tmp as FCampaignProgress)
        }

        return prog;
    }

    async getGlobalEvents() {
        const q = query(collection(this.db, "HelldiversDB", ...["WarSeason_801", "GlobalEvents"]),
            orderBy("created", "asc"));

        const qs = await getDocs(q);

        let events: FGlobalEvent[] = []

        for (let i = 0; i < qs.docs.length; i++) {
            let tmp = qs.docs[i].data()
            events.push(tmp as FGlobalEvent)
        }

        return events;
    }

    async getLastGlobalEvent() {
        const q = query(collectionGroup(this.db, "GlobalEvents"), orderBy("updated", "desc"), limit(1));

        const eventSnapshot = await getDocs(q);
        // eventSnapshot.metadata
        return eventSnapshot.docs[0].data() as FGlobalEvent;
    }

    async getGlobalEventByID(id: number) {
        const q = query(collectionGroup(this.db, "GlobalEvents"), where("id", "==", id));

        const eventSnapshot = await getDocs(q);
        // eventSnapshot.metadata
        return eventSnapshot.docs;
    }

    async getSiteMessage() {

        const q = query(collection(this.db, "HelldiversDB", ...["Site", "Messages"]), orderBy("timestamp", "desc"), limit(1));
        const messageSnap = await getDocs(q);

        // eventSnapshot.metadata
        if (messageSnap.docs.length > 0) {
            if ((messageSnap.docs[0].data().expires.seconds * 1000) <= new Date().getTime()) {
                return {}
            }
    
            return messageSnap.docs[0].data();
        }

        return {}
        
    }

    async getGalaxyStats(fromDate: Date) {
        const q = query(collectionGroup(this.db, "GalaxyStats"), where("created", ">=", fromDate));

        const statsSnapshot = await getDocs(q);
        // eventSnapshot.metadata
        return statsSnapshot.docs;
    }

    async getCampaignsFromIndex(planetIndex: number, startTime?: Date, endTime?: Date) {
        //const q = query(collectionGroup(this.db, "GlobalEvents"), where("id", "==", id));
        //console.log(startTime)
        let q
        if (startTime != undefined && endTime != undefined) {
            q = query(collectionGroup(this.db, "Campaigns"),
                where("planetIndex", "==", planetIndex),
                where("updated", ">=", startTime),
                where("updated", "<=", endTime));
        } else if (startTime != undefined && endTime == undefined) {
            //console.log("entering")
            q = query(collectionGroup(this.db, "Campaigns"),
                where("planetIndex", "==", planetIndex),
                where("updated", ">=", startTime),
                where("updated", "<=", new Date()));
        } else {
            q = query(collectionGroup(this.db, "Campaigns"),
                where("planetIndex", "==", planetIndex))
        }

        const eventSnapshot = await getDocs(q);
        //console.log(eventSnapshot.docs)
        // eventSnapshot.metadata
        return eventSnapshot.docs;
    }

    async getFirstAndLastProgress(campaignID: number) {
        const q1 = query(collectionGroup(this.db, "progress"),
            where("parentID", "==", campaignID),
            orderBy("created", "asc"),
            limit(1))

        const q2 = query(collectionGroup(this.db, "progress"),
            where("parentID", "==", campaignID),
            orderBy("created", "desc"),
            limit(1))

        const snap1 = await getDocs(q1);
        const snap2 = await getDocs(q2);

        return ({ first: snap1.docs[0].data(), last: snap2.docs[0].data() })
    }

}

export enum FirebaseCampaignResult {
    active = 0,
    success = 1,
    failure = 2
}