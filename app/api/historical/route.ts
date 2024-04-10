import FirebaseInstance from "@/app/classes/firebase";
import { HistoricalAPI, StatusAPI } from "@/app/types/app_types";
import { queryStatusExternal } from "@/app/utilities/server_functions";
import moment from "moment";

//TODO: This shouldnt need both planetID and campaignID. Only campaignID should be necessary
async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)
    let planetID: number = Number(params.searchParams.get("planetID"))
    let campaignID: number = Number(params.searchParams.get("campaignID"))
    let hours: number = Number(params.searchParams.get("hours"))

    let dbResponse = new FirebaseInstance();
    let newerThan = moment(new Date()).subtract((hours != undefined) ? hours : 0, 'hours').toDate()

    let progress: HistoricalAPI[] = [];
    if (planetID == 0 || campaignID == 0) {
        let status: StatusAPI | undefined = await queryStatusExternal();
        if (status != undefined) {
            for (let i = 0; i < status.status.campaigns.length; i++) {
                let element = status.status.campaigns[i]
                progress.push({campaignId: element.id, progress: await dbResponse.geProgressData(element.planetIndex, element.id, newerThan)})
            }
        }

    } else {
        progress.push({campaignId: campaignID, progress: await dbResponse.geProgressData(planetID, campaignID, newerThan)})
    }

    return Response.json(progress);
}


export { requestHandler as GET };