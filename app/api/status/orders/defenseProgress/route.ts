import { getPlanetNameFromID, queryAssignmentExternal } from "@/app/utilities/server_functions";
import path from "path";
import fs from 'fs';
import FirebaseInstance from "@/app/classes/firebase";
import { FGlobalEvent, FPlanetEvent } from "@/app/types/firebase_types";
import { PlanetEventAPI } from "@/app/types/app_types";

async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)
    const db = new FirebaseInstance();

    let from: Date;
    let to: Date;
    if (params.searchParams.get("from") != undefined && params.searchParams.get("to") != undefined) {
        from = new Date(Number(params.searchParams.get("from")))
        to = new Date(Number(params.searchParams.get("to")))
    } else if (params.searchParams.get("eventId") != undefined) {
        //Check DB
        const eventId = Number(params.searchParams.get("eventId"))
        const ge: FGlobalEvent = await db.getGlobalEventByID(eventId)
        from = new Date(ge.created.seconds * 1000);
        to = new Date(ge.expires.seconds * 1000);
    } else {
        return Response.json({message: "Improper request"})
    }


    //console.log(from + " - " + to)
    const res = await db.getSuccessfulDefenseCampaigns(from, to)
    let successfulDefenses: PlanetEventAPI[] = []

    res.forEach(element => {
        let event: FPlanetEvent = element.data() as FPlanetEvent;

        successfulDefenses.push({
            planetName: getPlanetNameFromID(event.planetIndex),
            ...event,
        })
    });


  return Response.json(successfulDefenses)
}

export { requestHandler as GET };