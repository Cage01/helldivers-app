import { queryGalaxyStatsExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {
  return Response.json(await queryGalaxyStatsExternal());
}

export { requestHandler as GET };