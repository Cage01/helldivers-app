import { queryNewsFeedExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {
  return Response.json(await queryNewsFeedExternal());
}

export { requestHandler as GET };