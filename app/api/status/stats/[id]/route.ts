import FirebaseInstance from "@/app/classes/firebase";


async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)

    const firebase = new FirebaseInstance();

    let startTime: number = Number(params.searchParams.get("startTime"))
    //console.log(startTime)
    if (startTime == 0) {
        let globalEventId: number = Number(params.searchParams.get("globalEventId"))
        let resEvent = await firebase.getGlobalEventByID(globalEventId)

        startTime = resEvent[0].data().created.seconds * 1000
        //console.log(startTime)
    }

    const tmp = params.pathname.split("/")
    const id = tmp[tmp.length - 1]

    
    let campaigns = await firebase.getCampaignsFromIndex(Number(id), new Date(startTime))

    let res: any[] = []
    for (let i = 0; i < campaigns.length; i++) {
        const element = campaigns[i]
        let fl = await firebase.getFirstAndLastProgress(element.data().id)

        res.push({campaignID: element.id, ...fl})
    }
    return Response.json(res)
}

export { requestHandler as GET };