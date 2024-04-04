import { queryExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {
  return Response.json(await queryExternal());
}

export { requestHandler as GET };