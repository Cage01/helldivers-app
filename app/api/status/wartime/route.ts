import { queryExternal, queryWarTimeExternal } from "@/app/utilities/server_functions";

async function requestHandler(_request: Request): Promise<Response> {
  let serverTime = await queryWarTimeExternal();
  

  return Response.json({message: "Hello"});
}

export { requestHandler as GET };