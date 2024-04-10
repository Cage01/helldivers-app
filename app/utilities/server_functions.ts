import { Campaign } from "../types/api/helldivers/galaxy_status_types";
import fs from 'fs';
import path from "path";
import { SteamNews } from "../types/api/steam/steam_news_types";
import { PlanetsAPI, StatusAPI } from "../types/app_types";
import { getPlanetEnemyID, getPlanetEvent } from "./universal_functions";
import FirebaseInstance from "../classes/firebase";
import { Assignment, Task } from "../types/api/helldivers/assignment_types";
import { FGlobalEvent } from "../types/firebase_types";
import { MajorOrderType } from "../classes/enums";

const baseURL = "https://api.live.prod.thehelldiversgame.com/api/"

export async function queryWarTimeExternal() {
  try {
    const res = await fetch(baseURL + "WarSeason/801/WarTime", { next: { revalidate: 10 } });
    res.headers.append("Accept-Language", "en-US,en;q=0.5")

    return await res.json()
  } catch (error) {
    console.error(error)
  }

  return {};
}

export async function queryStatusExternal() {
  try {
    const res_info = await fetch(baseURL + 'WarSeason/801/WarInfo', { next: { revalidate: 20 } });
    const warInfo = await res_info.json();

    const res_status = await fetch(baseURL + 'WarSeason/801/Status', { next: { revalidate: 20 } });
    const status = await res_status.json();

    let campaignWaypoints: { planetIndex: number, planetName: string, campaignId: number; waypoints: any; }[] = []
    status.campaigns.forEach((element: Campaign) => {
      campaignWaypoints.push({ planetIndex: element.planetIndex, planetName: getPlanetNameFromID(element.planetIndex), campaignId: element.id, waypoints: warInfo.planetInfos[element.planetIndex].waypoints })
    });

    return ({ info: warInfo, status: status, campaignWaypoints: campaignWaypoints } as StatusAPI)
  } catch (error) {
    console.error(error)
  }

  return {} as StatusAPI;
}

export async function queryNewsFeedExternal() {

  let time = (await queryWarTimeExternal()).time;
  time -= 172800 //1 day

  try {
    const res = await fetch(baseURL + 'NewsFeed/801?fromTimestamp=' + time, { next: { revalidate: 20 } });
    res.headers.append("Accept-Language", "en-US,en;q=0.5")
    return await res.json()
  } catch (error) {
    console.error(error)
  }

  return {};
}

// Major Orders
export async function queryAssignmentExternal() {
  try {
    const res = await fetch(baseURL + "v2/Assignment/War/801", { next: { revalidate: 20 } });
    res.headers.append("Accept-Language", "en-US,en;q=0.5")

    let apiAssignment = await res.json();


    let status = await queryStatusExternal();

    if (apiAssignment.length > 0) {
      let assignment: Assignment = apiAssignment[0];

      //TODO: There could be an instance where there are multiple major orders to iterate through
      assignment.source = "api"
      assignment.setting.tasks = updateTasks(assignment.setting.tasks)
      assignment.determinedType = determineAssignmentType(assignment)
      
      let enemy = await getAssignmentEnemy(assignment, assignment.setting.tasks, status);
      assignment.enemyID = enemy;

      return assignment;
    } else {
      //Get last order
      const db = new FirebaseInstance();
      const last: FGlobalEvent = await db.getLastGlobalEvent()
      const expiresIn = last.expires.seconds - (new Date().getTime() / 1000)

      const tasks = updateTasks(last.tasks)

      const prevAssignment: Assignment = {
        source: "database",
        determinedType: last.determinedType,
        enemyID: last.enemyID,
        id32: last.id,
        progress: last.progress,
        expiresIn: expiresIn,
        setting: {
          type: last.type,
          overrideTitle: last.overrideTitle,
          overrideBrief: last.overrideBrief,
          taskDescription: last.taskDescription,
          tasks: tasks,
          reward: last.reward,
          flags: last.flags
        }
      }
      return prevAssignment
    }
  } catch (error) {
    console.error(error)
  }
  
  return {} as Assignment
}


function updateTasks(tasks: any[]) {
  const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))
  for (let i = 0; i < tasks.length; i++) {
    const index = tasks[i].values[2]
    const updatedTasks: Task = {
      planetIndex: index,
      planetName: planets[index].name,
      ...tasks[i],
    }

    tasks[i] = updatedTasks
  }

  return tasks;
}

function determineAssignmentType(assignment: Assignment) {
  let type = MajorOrderType.unknown;

  if (assignment.setting.taskDescription.split(" ")[0] == "Liberate") {
    type = MajorOrderType.liberate
  }
  else if (assignment.setting.taskDescription.includes("Designated planets must be under Super Earth control when order expires")) {
    type = MajorOrderType.control
  } else if (assignment.setting.taskDescription.toLowerCase().includes("defense") || assignment.setting.taskDescription.toLowerCase().includes("defend")) {
    type = MajorOrderType.defend
  }

  return type;
}

export async function getAssignmentEnemy(assignment: Assignment, tasks: Task[], status: StatusAPI) {
  //console.log(assignmentID)
  let assignmentEnemy = 0;

  if (assignment.setting.overrideBrief.toLowerCase().includes("automaton")) {
    assignmentEnemy = 3
  } else if (assignment.setting.overrideBrief.toLowerCase().includes("terminid") || assignment.setting.overrideBrief.toLowerCase().includes("bug")) {
    assignmentEnemy = 2
  } else {
    for (let i = 0; i < tasks.length; i++) {
      let id = getPlanetEnemyID(tasks[i].planetIndex, status)
      if (id > 1) {
        assignmentEnemy = id;
      }
    }
  
    if (assignmentEnemy <= 1) {
      //Check database
      const db = new FirebaseInstance();
      let event: FGlobalEvent = await db.getGlobalEventByID(assignment.id32)
      if (event != undefined) {
        assignmentEnemy = event.enemyID
      }
    }
  }



  return assignmentEnemy;
}

export async function queryGalaxyStatsExternal() {
  try {
    const res = await fetch('https://api.diveharder.com/raw/planetStats', { next: { revalidate: 20 } })
    res.headers.append("Accept-Language", "en-US,en;q=0.5")

    return await res.json();
  } catch (error) {
    console.log("ERRORS")
    console.error(error)
  }

  return {}
}

export async function querySteamNews() {
  const res_steam_news = await fetch('https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=' + process.env.NEXT_PUBLIC_STEAM_APP_ID + "&count=500")
  const news: SteamNews = await res_steam_news.json();
}



export function getRandomPlanetImage() {
  const files: string[] = fs.readdirSync(path.join(process.cwd(), "public/images/planets"));
  return "/images/planets/" + files[Math.floor(Math.random() * files.length)];
}


export function getPlanetNameFromID(index: number): string {
  const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))

  return planets[index].name
}


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

export function buildPlanetAPIResponse(apiStatus: StatusAPI) {
  let res: campaign[] = [];

  if (apiStatus.info != undefined && apiStatus.status != undefined) {
    for (let i = 0; i < apiStatus.status.campaigns.length; i++) {
      let campaign = apiStatus.status.campaigns[i]

      const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))

      let planetImage = "";
      const imgPath = path.join(process.cwd(), "public/" + planets[campaign.planetIndex].img);
      if (fs.existsSync(imgPath)) {
        planetImage = planets[campaign.planetIndex].img;
      } else {
        console.log(imgPath + " not found. Getting random image")
        planetImage = getRandomPlanetImage();
      }

      let planetStatus = apiStatus.status.planetStatus[campaign.planetIndex];
      let planetInfo = apiStatus.info.planetInfos[campaign.planetIndex];
      let planetEvent = getPlanetEvent(campaign.planetIndex, apiStatus.status)


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

  return res as PlanetsAPI[]
}