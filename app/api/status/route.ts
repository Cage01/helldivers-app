import { queryStatusExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {
  return Response.json(await queryStatusExternal());
}

export { requestHandler as GET };