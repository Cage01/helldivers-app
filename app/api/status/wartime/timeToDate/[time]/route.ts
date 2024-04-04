import { queryWarTimeExternal } from "@/app/utilities/server_functions";
import moment from "moment";


async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)

    const tmp = params.pathname.split("/")
    const time: number = Number(tmp[tmp.length - 1])

    let serverTime = (await queryWarTimeExternal()).time;
    let delta = serverTime - time;

    return Response.json({ date: moment().subtract(delta, 'seconds').toDate(), time: moment().subtract(delta, 'seconds').toDate().getTime() })
}

export { requestHandler as GET };