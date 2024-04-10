import FirebaseInstance from "@/app/classes/firebase";
import { FGlobalEvent } from "@/app/types/firebase_types";
import moment from "moment";

async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)

    const tmp = params.pathname.split("/")
    const id: number = Number(tmp[tmp.length - 1])


    //Get event created time
    const firebase = new FirebaseInstance();
    let resEvent: FGlobalEvent = await firebase.getGlobalEventByID(id)

    let created
    if (resEvent != undefined) {
       created = new Date(resEvent.created.seconds * 1000)
    } else {
        //Major orders have swapped and nothing is currently up
        created = moment().subtract("3", "hours").toDate()
    }

    try {
        //Get all stats since that time
        let resStats = await firebase.getGalaxyStats(created)
        let stats: any[] = []
        resStats.forEach(element => {
            stats.push(element.data())
        });
        return Response.json(stats)
    } catch (err) {
        console.error(err)
        return Response.json(undefined)
    }


}

export { requestHandler as GET };