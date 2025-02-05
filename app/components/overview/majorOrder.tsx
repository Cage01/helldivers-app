"use client"
import { Card, CardHeader, Divider, CardBody, Checkbox, Image, Spinner, Tooltip } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import CountdownTimer from '../countdown'
import { Assignment } from '@/app/types/api/helldivers/assignment_types'
import { fetcher } from '@/app/classes/fetch'
import useSWR from 'swr'
import { Campaign } from '@/app/types/api/helldivers/galaxy_status_types'
import AnimatedNumber from "animated-number-react";
import moment from 'moment'
import MajorOrderStats from './majorOrderStats'
import Planet from '@/app/classes/planet'
import { MajorOrderAssociation, MajorOrderType } from '@/app/classes/enums'
import { PlanetEventAPI, PlanetsAPI, StatusAPI } from '@/app/types/app_types'
import { FPlanetEvent } from '@/app/types/firebase_types'

interface Defense {
    name: string,
    completed: boolean
}

function MajorOrderCard(props: { className?: string, majorOrder: Assignment }) {

    const [assignment, setAssignment] = useState<Assignment>()
    const [endtime, setEndtime] = useState(0);
    const [warState, setWarState] = useState<StatusAPI>();
    const [playerCount, setPlayerCount] = useState(0);
    const [planets, setPlanets] = useState<Planet[]>();
    const [defenseTracker, setDefenseTracker] = useState<Defense[]>()
    // console.log(defenseTracker)

    const apiStatus: StatusAPI = (useSWR("/api/status", fetcher, { refreshInterval: 20000 })).data;
    const apiPlanets: PlanetsAPI[] = (useSWR("/api/planets", fetcher, { refreshInterval: 20000 })).data;

    const defenseProgress: PlanetEventAPI[] = useSWR((props.majorOrder.determinedType == MajorOrderType.defend) ? "/api/status/orders/defenseProgress?eventId=" + props.majorOrder.id32 : null, fetcher, { refreshInterval: 30000 }).data
    // console.log(props.majorOrder.determinedType)
    // console.log("Assignment enemy: " + props.majorOrder.enemyID)
    
    //console.log(endtime)
    useEffect(() => {

        //TODO: this can come in as an array, so should build something to deal with that
        if (props.majorOrder != undefined && apiStatus != undefined && apiPlanets != undefined) {
            setWarState(apiStatus)
            setAssignment(props.majorOrder)



            let count = 0;
            let allPlanets: Planet[] = [];
            apiStatus.status.campaigns.forEach((campaign: Campaign) => {
                let p = new Planet(props.majorOrder, campaign, apiStatus, apiPlanets)
                allPlanets.push(p)
            });

            allPlanets.forEach((planet: Planet) => {
                // console.log(planet)

                if (planet.majorOrderAssociation == MajorOrderAssociation.mainObjective || (planet.hasEvent && planet.enemyFactionID == props.majorOrder.enemyID)) {
                    count += planet.playerCount;
                } else if (planet.majorOrderAssociation == MajorOrderAssociation.associated
                    && !allPlanets.some((e) => e.majorOrderAssociation == MajorOrderAssociation.mainObjective)) {

                    count += planet.playerCount;
                } else if (planet.majorOrderAssociation == MajorOrderAssociation.tertiary
                    && (!allPlanets.some((e) => e.majorOrderAssociation >= MajorOrderAssociation.associated))) {

                    count += planet.playerCount;
                } else if (props.majorOrder.determinedType == MajorOrderType.defend && planet.hasEvent && planet.enemyFactionID == props.majorOrder.enemyID) {
                    count += planet.playerCount
                }


            });

            setPlayerCount(count)
            setPlanets(allPlanets)

            if (endtime == 0) {
                setEndtime(moment().add(props.majorOrder.expiresIn, "seconds").toDate().getTime())
            }

        }

    }, [props.majorOrder, apiStatus, apiPlanets])

    useEffect(() => {
        if (defenseProgress != undefined && planets != undefined && planets.length > 0) {
            //Everything pulled from the database is a successful defense during the timeframe of this Order
            const tmpDefenses: Defense[] = []
            for (let i = 0; i < defenseProgress.length; i++) {
                tmpDefenses.push({ name: defenseProgress[i].planetName, completed: true })
            }

            //Every defense campaign currently active has not been successful yet (obviously)
            for (let i = 0; i < planets.length; i++) {
                if (planets[i].hasEvent) {
                    tmpDefenses.push({ name: planets[i].name, completed: false })
                }
                
            }

            setDefenseTracker(tmpDefenses)
        }
    }, [defenseProgress, planets])


    const formatValue = (value: number) => {
        return value.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true })
    };
    return (
        <div className={(props.className != undefined) ? props.className : ""}>
            {(assignment != undefined && warState != undefined) ?
                <Card >
                    <CardHeader className='flex-wrap items-center justify-center -mt-4'>
                        <div className='absolute w-full text-left smphone:ml-11 phone:ml-6'>

                            <div className='smphone:ml-6 phone:ml-3 md:ml-0 -mt-8'>
                                <span className='font-bold'>{assignment.setting.reward.amount}</span>{(assignment.setting.reward.type == 1) ? <Image className="absolute ml-5 -mt-[1.6rem]" src='/images/medals_gold.svg' width={30} /> : <></>}
                            </div>

                            <div className='smphone:ml-4 smphone:mt-16 md:ml-0 absolute md:mt-9  before:bg-white/10 border-white/20 border-1 rounded-large px-3 shadow-small'>
                                <CountdownTimer expiresIn={assignment.expiresIn} />
                            </div>
                        </div>
                        <Tooltip content="The number of players fighting in campaigns that have the most impact on the active war efforts." showArrow={true}>
                            <p className='text-sm absolute w-full text-right smphone:mr-[5.1rem] phone:mr-14 sm:mr-6 smphone:-mt-16 phone:-mt-11'><span className='font-bold'><AnimatedNumber aria-label="deaths" value={playerCount} formatValue={formatValue} duration={1100} /></span> Players</p>
                        </Tooltip>

                        <div className='flex flex-wrap items-start justify-center'>
                            <Image
                                src='/images/major_order.svg'
                                width={70}
                            />
                            <div className='w-full text-center subtitle'>Major Order</div>
                        </div>
                    </CardHeader>
                    <Divider className='smphone:mt-5 md:mt-0' />
                    <CardBody className='mt-5 flex-wrap items-center justify-center'>
                        <div className='-mt-4 w-full px-12' >
                            <p className='text-center text-sm font-bold text-gray-300'>{assignment.setting.taskDescription}</p>

                            <div className="grid grid-cols-2 gap-4 mt-4 px-3 py-3 w-full" style={{ backgroundColor: "#0c0c0d", borderRadius: "10px" }}>
                                {(defenseTracker != undefined && props.majorOrder.determinedType == MajorOrderType.defend) ?
                                    
                                    defenseTracker.map((campaign, index) => (
                                        <Checkbox key={campaign.name+"_"+index} isSelected={campaign.completed} isReadOnly={true} icon={<Image src='/images/helldivers_skull.svg' />}>{campaign.name}</Checkbox>
                                    ))
                                    :
                                    assignment.setting.tasks.map((task, index) => (
                                        <Checkbox key={task.planetName} isSelected={(assignment.progress[index] == 0) ? false : true} isReadOnly={true} icon={<Image src='/images/helldivers_skull.svg' />}>{task.planetName}</Checkbox>
                                    ))
                                }
                                {/* {assignment.setting.tasks.map((task, index) => (
                                    <Checkbox key={task.planetName} isSelected={(assignment.progress[index] == 0) ? false : true} isReadOnly={true} icon={<Image src='/images/helldivers_skull.svg' />}>{task.planetName}</Checkbox>
                                ))} */}


                            </div>

                        </div>

                        <div className='w-full pt-5'>
                            <div className='w-full text-center subtitle'>Stats for this Order</div>
                            <MajorOrderStats war={warState} assignment={assignment} />
                        </div>
                    </CardBody>
                </Card>
                :
                <div className='flex-wrap items-center justify-center'>
                    <Spinner color="default" />
                </div>}

        </div>
    )
}

export default MajorOrderCard