import { PlanetStatus, PlanetEvent, GalaxyStatus, Campaign } from "@/app/types/api/helldivers/galaxy_status_types";
import { PlanetInfo } from "@/app/types/api/helldivers/war_info_types";
import { Assignment } from "../types/api/helldivers/assignment_types";
import { MajorOrderAssociation } from "./enums";
import { PlanetsAPI, StatusAPI } from "../types/app_types";
import { getPlanetEvent } from "../utilities/universal_functions";

class Planet {
    index: number
    name: string = "";
    image: string = "";
    time: number

    health: number
    maxHealth: number
    playerCount: number
    liberation: number

    status: PlanetStatus
    info: PlanetInfo
    event: PlanetEvent | null
    hasEvent: boolean
    campaign: Campaign
    waypoints: number[]

    enemyFactionID: number
    enemyFactionName: string = "";
    enemyFactionImage: string = "";

    majorOrderAssociation: MajorOrderAssociation = MajorOrderAssociation.unrelated;


    constructor(majorOrder: Assignment, campaign: Campaign, apiStatus: StatusAPI, apiPlanets?: PlanetsAPI[]) {
        this.campaign = campaign;
        this.time = apiStatus.status.time;
        this.index = campaign.planetIndex;
        //TODO: This will need to be updated to be more dynamic
        

        if (apiPlanets != undefined) {
            apiPlanets.forEach((element: PlanetsAPI) => {
                if (element.id == campaign.id) {
                    this.name = element.planet.name;
                    this.image = element.planet.image
                    this.enemyFactionName = element.faction.name;
                    this.enemyFactionImage = element.faction.image;
                }
            });
        }



        //Setting planet specific data
        this.status = apiStatus.status.planetStatus[this.index];
        this.info =  apiStatus.info.planetInfos[this.index];
        this.event = getPlanetEvent(this.index, apiStatus.status);



        this.playerCount = this.status.players;
        this.waypoints = this.info.waypoints;

        //Getting association to major order
        for (let i = 0; i < majorOrder.setting.tasks.length; i++) {
            const order = majorOrder.setting.tasks[i]
            if (this.index == order.planetIndex) {
                this.majorOrderAssociation = MajorOrderAssociation.mainObjective
                break
            }

            if (this.waypoints.includes(order.planetIndex)) {
                this.majorOrderAssociation = MajorOrderAssociation.associated;
                continue
            }

            //Get waypoints for this task planet id
            const taskWaypoints = apiStatus.info.planetInfos[order.planetIndex].waypoints
            if (taskWaypoints.includes(this.index)) {
                this.majorOrderAssociation = MajorOrderAssociation.associated
                continue
            }

            //Get waypoints of all associated planets
            taskWaypoints.forEach(wayPlanet => {
                if (apiStatus.info.planetInfos[wayPlanet].waypoints.includes(this.index)) {
                    this.majorOrderAssociation = MajorOrderAssociation.tertiary
                }
            });
        }


        if (this.event == null){
            this.hasEvent = false;
            this.enemyFactionID = (this.status.owner > 1) ? this.status.owner : this.info.initialOwner;
        } else {
            this.hasEvent = true;
            this.enemyFactionID = this.event.race;
        }

        //Getting attacking race 
        // console.log(this.name + " fighting " + this.enemyFactionID)
        // console.log(this.assignmentFactionID + " - " + this.enemyFactionID)


        this.health = 0;
        this.maxHealth = 0;
        if (this.event != null) {
            this.health = this.event.health;
            this.maxHealth = this.event.maxHealth;
        } else {
            this.health = this.status.health;
            this.maxHealth = this.info.maxHealth;
        }

        this.liberation = this.getLiberationPercentage()

    }

    getLiberationPercentage(): number {
        let progress = (this.health / this.maxHealth) * 100;
        progress = 100 - progress;

        return progress;
    }
}



export default Planet