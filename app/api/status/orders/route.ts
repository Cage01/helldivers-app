import { queryAssignmentExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {
  let res = await queryAssignmentExternal();
  return Response.json(res)
}

export { requestHandler as GET };