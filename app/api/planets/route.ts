import { queryStatusExternal, buildPlanetAPIResponse } from "@/app/utilities/server_functions";
import { StatusAPI } from "@/app/types/app_types";

interface campaign {
  id: number,
  planet: {
    index: number,
    name: string,
    image: string,
  },
  faction: {
    name: string,
    image: string,
  }
}

async function requestHandler(_request: Request): Promise<Response> {
  let apiStatus: StatusAPI = await queryStatusExternal()

  let res = buildPlanetAPIResponse(apiStatus)

  return Response.json(res);
}

export { requestHandler as GET };