import { queryWarTimeExternal } from "@/app/utilities/server_functions";

const EPOCH_DIGITS = 10;
async function requestHandler(_request: Request): Promise<Response> {
    let params = new URL(_request.url)

    const tmp = params.pathname.split("/")
    let inDate: number;

    //epoch seconds is 10 digits
    if (tmp[tmp.length - 1].length > EPOCH_DIGITS)  {
        inDate = Number(tmp[tmp.length - 1]) / 1000
    } else {
        inDate = Number(tmp[tmp.length - 1])
    }

    let serverTime = (await queryWarTimeExternal()).time;

    let now = new Date().getTime() / 1000;
    let diff = Math.ceil(inDate - now);

    let delta = serverTime + diff;

    return Response.json({time: delta})
    
}

export { requestHandler as GET };