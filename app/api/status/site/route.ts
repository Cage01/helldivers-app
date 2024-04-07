import FirebaseInstance from "@/app/classes/firebase";
import { queryExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {

    let dbResponse = new FirebaseInstance();
    const message = await dbResponse.getSiteMessage();
    return Response.json(message);
}

export { requestHandler as GET };