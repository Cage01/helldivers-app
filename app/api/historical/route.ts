import FirebaseInstance from "@/app/classes/firebase";
import moment from "moment";


async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)
    let planetID: number = Number(params.searchParams.get("planetID"))
    let campaignID: number = Number(params.searchParams.get("campaignID"))
    let hours: number = Number(params.searchParams.get("hours"))

    let dbResponse = new FirebaseInstance();
    let newerThan = moment(new Date()).subtract(hours, 'hours').toDate()
    let progress = await dbResponse.geProgressData(planetID, campaignID, newerThan);

    return Response.json(progress);
}


export { requestHandler as GET };