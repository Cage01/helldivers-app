import { GalaxyStatus, PlanetEvent, PlanetStatus } from "../types/api/helldivers/galaxy_status_types";
import Planet from "../classes/planet";
import { MajorOrderAssociation, MajorOrderType } from "../classes/enums";
import { FCampaignProgress } from "../types/firebase_types";
import { StatusAPI } from "../types/app_types";
import { Assignment } from "../types/api/helldivers/assignment_types";

export function getPlanetEvent(index: number, status: GalaxyStatus): PlanetEvent | null {
    var foundEvent: PlanetEvent | null = null;
    for (var event of status.planetEvents) {
        if (event.planetIndex == index) {
            foundEvent = event;
            break;
        }
    }
    return foundEvent;
}

const max = 1000
export function sortPlanets(assignment: Assignment, planets: Planet[], sortByPercentage: boolean = false, index: number = 0, tier: number = 1) {
    // console.log(tier)
    //console.log(index)
    if (index < planets.length) {
        var highestNum = (sortByPercentage) ? planets[index].liberation : planets[index].enemyFactionID

        var foundIndex = -1;

        for (var i = index; i < planets.length; i++) {
            let num = -1;
            if (sortByPercentage) {
                if (tier == 1) {
                    if (planets[i].majorOrderAssociation == MajorOrderAssociation.mainObjective 
                        || (assignment.determinedType == MajorOrderType.defend && planets[i].enemyFactionID == assignment.enemyID)) {
                        //console.log("Name: " + planets[i].name + " - ID: " + planets[i].index + " - level: " + planets[i].majorOrderAssociation + " - PlanetEnemy: " + planets[i].enemyFactionID + " - AssignmentEnemy: " + assignment.enemyID)

                        num = max + planets[i].liberation
                    } else if (planets[i].majorOrderAssociation == MajorOrderAssociation.associated && planets[i].hasEvent) {
                        num = max - 100 + planets[i].liberation
                    } else if (planets[i].majorOrderAssociation == MajorOrderAssociation.associated && !planets[i].hasEvent) {
                        num = max - 105 + planets[i].liberation
                    } else if (planets[i].hasEvent && planets[i].enemyFactionID == assignment.enemyID) {
                        num = max - 105 + planets[i].liberation
                    } else if (planets[i].majorOrderAssociation == MajorOrderAssociation.tertiary) {
                        num = max - 150 + planets[i].liberation
                    } else if (planets[i].hasEvent) {
                        num = max - 160 + planets[i].liberation
                    } else {
                        num = planets[i].liberation;
                    }
                    //console.log(planets[i].name + " " + num)
                } else {
                    
                    num = planets[i].liberation

                }


            } else {
                num = planets[i].enemyFactionID
            }

            //const num = (sortByPercentage) ? planets[i].liberation : planets[i].enemyFactionID;
            if (num > highestNum) {
                highestNum = num;

                foundIndex = i;
            }
        }

        //console.log(highestNum)

        if (foundIndex > -1) {

            const tmp = planets[index]
            planets[index] = planets[foundIndex]
            planets[foundIndex] = tmp
        }

        index += 1
        sortPlanets(assignment, planets, sortByPercentage, index, tier)
    }


    return planets;
}

export function getPlanetEnemyID(planetIndex: number, apiStatus: StatusAPI ) {
    let enemyFactionID = 0;
    let status = apiStatus.status.planetStatus[planetIndex];
    let info =  apiStatus.info.planetInfos[planetIndex];
    let event = getPlanetEvent(planetIndex, apiStatus.status);
    
    if (event == null){
        enemyFactionID = (status.owner > 1) ? status.owner : info.initialOwner;
    } else {
        enemyFactionID = event.race;
    }

    return enemyFactionID;
}



export function getDecayRate(maxHealth: number, regenRate: number, hasEvent: boolean, history?: FCampaignProgress[]) {
    if (history != undefined) {
        let liberation: number[] = []
  
        for (let i = 0; i < history.length; i++) {
          let curr = 100 - ((history[i].health / history[i].maxHealth) * 100)
          liberation.push(curr)
        }
      
      
        let meanDiff = 0;
        for (let i = 1; i < liberation.length; i++) {
          meanDiff += liberation[i] - liberation[i - 1]
        }
      
        /*
        * meanDiff / healthDifferenceHistory.length comes out to be mean health of 5 minutes over the course of the last 30 minutes
        * Divide by 300 to get health difference per second
        * Multiply by 100 to get percentage
        * Multiply by 60 to get per hour value
        */
        meanDiff = Math.max((meanDiff / history.length) * 12, 0)
      
        let regenPerHour = 0
        if (!hasEvent)
          regenPerHour = (((regenRate / maxHealth) * 100) * 60)
      
        let decayRate = meanDiff - regenPerHour;
        return decayRate
    }

    return 0;
  }

export function getTotalCount(planets: PlanetStatus[]) {
    let total = 0;
    planets.forEach(element => {
        total += element.players;
    });

    return total;
}
// export function getRealtimeExpiration(currentServerTime: number, endServerTime: number) {
//     let delta = moment().add((endServerTime - currentServerTime), 'seconds').toDate().getTime()
    
// }