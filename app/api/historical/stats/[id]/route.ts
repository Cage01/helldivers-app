import FirebaseInstance from "@/app/classes/firebase";

async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)

    const tmp = params.pathname.split("/")
    const id: number = Number(tmp[tmp.length - 1])


    //Get event created time
    const firebase = new FirebaseInstance();
    let resEvent = await firebase.getGlobalEventByID(id)

    let created = new Date(resEvent[0].data().created.seconds * 1000)

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