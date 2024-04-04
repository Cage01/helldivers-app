import { GalaxyStatus, PlanetEvent, PlanetStatus } from "../types/api/helldivers/galaxy_status_types";
import { WarInfo, PlanetInfo } from "../types/api/helldivers/war_info_types";
import Planet from "../classes/planet";
import { MajorOrderAssociation } from "../classes/enums";

export function getPlanetStatus(index: number, status: GalaxyStatus): PlanetStatus {
    var planet: PlanetStatus = status.planetStatus[0]

    for (var i = 0; i < status.planetStatus.length; i++) {
        if (status.planetStatus[i].index == index) {
            planet = status.planetStatus[i];
            break;
        }
    }

    return planet;
}

export function getPlanetInfo(index: number, warInfo: WarInfo): PlanetInfo {
    var planet: PlanetInfo = warInfo.planetInfos[0];

    for (var i = 0; i < warInfo.planetInfos.length; i++) {
        if (warInfo.planetInfos[i].index == index) {
            planet = warInfo.planetInfos[i];
            break;
        }
    }

    return planet;
}

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
export function sortPlanets(planets: Planet[], sortByPercentage: boolean = false, index: number = 0, tier: number = 1) {
    // console.log(tier)
    //console.log(index)
    if (index < planets.length) {
        var highestNum = (sortByPercentage) ? planets[index].liberation : planets[index].enemyFactionID

        var foundIndex = -1;

        for (var i = index; i < planets.length; i++) {
            let num = -1;
            if (sortByPercentage) {
                if (tier == 1) {
                    if (planets[i].majorOrderAssociation == MajorOrderAssociation.mainObjective) {
                        num = max + planets[i].liberation
                    } else if (planets[i].majorOrderAssociation == MajorOrderAssociation.associated && planets[i].hasEvent) {
                        num = max - 100 + planets[i].liberation
                    } else if (planets[i].majorOrderAssociation == MajorOrderAssociation.associated && !planets[i].hasEvent) {
                        num = max - 105 + planets[i].liberation
                    } else if (planets[i].hasEvent && planets[i].enemyFactionID == planets[i].assignmentFactionID) {
                        num = max - 105 + planets[i].liberation
                    } else if (planets[i].majorOrderAssociation == MajorOrderAssociation.tertiary) {
                        num = max - 150 + planets[i].liberation
                    } else if (planets[i].hasEvent) {
                        num = max - 160 + planets[i].liberation
                    } else {
                        num = planets[i].liberation;
                    }
                } else {
                    
                    num = planets[i].liberation
                    //console.log(planets[i].name + " " + num)
                }


            } else {
                num = planets[i].enemyFactionID
            }

            //console.log(planets[i].name + " " + num)
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
        sortPlanets(planets, sortByPercentage, index, tier)
    }


    return planets;
}
// export function getRealtimeExpiration(currentServerTime: number, endServerTime: number) {
//     let delta = moment().add((endServerTime - currentServerTime), 'seconds').toDate().getTime()
    
// }