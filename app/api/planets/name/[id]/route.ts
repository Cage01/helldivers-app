import { queryExternal, getRandomPlanetImage } from "@/app/utilities/server_functions";
import { getPlanetStatus, getPlanetInfo, getPlanetEvent } from "@/app/utilities/client_functions";
import path from "path";
import fs from 'fs';

interface campaign {
  id: number,
  planet: {
    name: string,
    image: string,
  },
  faction: {
    name: string,
    image: string,
  }
}

async function requestHandler(_request: Request): Promise<Response> {
  let params = new URL(_request.url)

  const tmp = params.pathname.split("/")
  const id = tmp[tmp.length-1]

  const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))

  return Response.json({ name: planets[id].name })
}

export { requestHandler as GET };