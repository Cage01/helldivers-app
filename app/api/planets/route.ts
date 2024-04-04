import { queryExternal, getRandomPlanetImage } from "@/app/utilities/server_functions";
import { getPlanetStatus, getPlanetInfo, getPlanetEvent } from "@/app/utilities/client_functions";
import path from "path";
import fs from 'fs';

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
  let { info, status } = await queryExternal()

  let res: campaign[] = [];

  if (info != undefined && status != undefined) {
    for (let i = 0; i < status.campaigns.length; i++) {
      let campaign = status.campaigns[i]

      const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))

      let planetImage = "";
      const imgPath = path.join(process.cwd(), "public/" + planets[campaign.planetIndex].img);
      if (fs.existsSync(imgPath)) {
        planetImage = planets[campaign.planetIndex].img;
      } else {
        console.log(imgPath + " not found. Getting random image")
        planetImage = getRandomPlanetImage();
      }

      let planetStatus = getPlanetStatus(campaign.planetIndex, status)
      let planetInfo = getPlanetInfo(campaign.planetIndex, info)
      let planetEvent = getPlanetEvent(campaign.planetIndex, status)

      let factionID = 0

      if (planetEvent != null) {
        factionID = planetEvent.race
      } else {
        if (planetStatus.owner > 1) {
          factionID = planetStatus.owner
        } else {
          factionID = planetInfo.initialOwner;
        }
      }


      //let factionID = (planetStatus.owner > 1) ? planetStatus.owner : planetInfo.initialOwner
      const factions = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/factions.json"), 'utf-8'));
      res.push({
        id: campaign.id,
        
        planet: {
          index: campaign.planetIndex,
          name: planets[campaign.planetIndex].name,
          image: planetImage
        },
        faction: factions[factionID]
      })
    }
  }


  return Response.json(res);
}

export { requestHandler as GET };