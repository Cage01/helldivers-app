"use client"
import { fetcher } from '@/app/classes/fetch';
import Planet from '@/app/classes/planet';
import { Assignment } from '@/app/types/api/helldivers/assignment_types';
import { HistoricalAPI, PlanetsAPI, StatusAPI } from '@/app/types/app_types';
import { getDecayRate, sortPlanets } from '@/app/utilities/universal_functions';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, CardHeader, CardBody, Image, Divider, CircularProgress, Spinner, CardFooter, Button, Popover, PopoverContent, PopoverTrigger, Tab, Tabs, Chip, Skeleton } from '@nextui-org/react'
import AnimatedNumber from "animated-number-react";
import React, { useEffect, useState } from 'react'
import useSWR from 'swr';
import CountdownTimer from '../countdown';



function PlanetQuickView(props: { majorOrder: Assignment, className?: string }) {


    const [historical, setHistorical] = useState<HistoricalAPI[]>();
    const [activePlanets, setActivePlanets] = useState<Planet[]>([]);
    const [victoryMap, setVictoryMap] = useState<Map<number, number>>();
    const [totalPlayers, setTotalPlayers] = useState(0);
    const apiStatus: StatusAPI = (useSWR("/api/status", fetcher, { refreshInterval: 20000 })).data;
    const apiPlanets: PlanetsAPI[] = (useSWR("/api/planets", fetcher, { refreshInterval: 20000 })).data;

    const apiHistorical: HistoricalAPI[] = (useSWR("/api/historical?hours=1", fetcher, { refreshInterval: 300000 })).data
    const majorOrder: Assignment = (useSWR("/api/status/orders", fetcher, { refreshInterval: 20000 })).data;

    useEffect(() => {
        if (apiStatus != undefined && apiPlanets != undefined && props.majorOrder != undefined && apiHistorical != undefined && majorOrder != undefined) {
            setHistorical(apiHistorical)

            let tmpMap = new Map<number, number>();
            let tmpPlanets: Planet[] = []
            for (let i = 0; i < apiStatus.status.campaigns.length; i++) {

                let campaign = apiStatus.status.campaigns[i];


                let p = new Planet(props.majorOrder, campaign, apiStatus, apiPlanets);
                tmpPlanets.push(p)

                //Update prediction
                const tmpDecay = getDecayRate(p.maxHealth, p.status.regenPerSecond, p.hasEvent, apiHistorical.find(h => h.campaignId == p.campaign.id)?.progress)
                let prd = Math.ceil(Math.max(((100 - p.liberation) / tmpDecay), 0) * 60 * 60) + apiStatus.status.time
                tmpMap.set(p.index, prd);
                // console.log(p.name + ": " + (prd - apiStatus.status.time))
            }


            setVictoryMap(tmpMap);

            sortPlanets(majorOrder, tmpPlanets, true)
            setActivePlanets(tmpPlanets)

            let playerCount = 0;
            apiStatus.status.planetStatus.forEach(element => {
                playerCount += element.players;
            });
            setTotalPlayers(playerCount)
        }


    }, [apiStatus, apiPlanets, props.majorOrder, apiHistorical, majorOrder]);

    useEffect(() => {
        if (apiHistorical != undefined) {
            setHistorical(apiHistorical)
        }

    }, [apiHistorical])

    const [isContentVisible, setContentVisible] = useState(false);


    const formatValueDecay = (value: number) => {
        return ((value > 0) ? "+" : "") + value.toLocaleString("en", { maximumFractionDigits: 3, minimumFractionDigits: 3 }) + "%"
    };


    const formatValue = (value: number) => {
        return value.toLocaleString('en', { useGrouping: true, maximumFractionDigits: 0, minimumFractionDigits: 0 })
    };

    const formatPlayerPercent = (value: number) => {
        return "(" + ((value / totalPlayers) * 100).toLocaleString('en', { maximumFractionDigits: 0 }) + "%)"
    }

    return (
        <div className={(props.className != undefined) ? props.className : ""}>
            <Card>
                <CardHeader className='flex flex-wrap items-start justify-center'>
                    <div className='flex flex-wrap items-start justify-center -mt-2'>
                        <Image
                            src='/images/earth.svg'
                            width={65}
                        />
                        <div className='w-full text-center subtitle'>Planet View</div>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>

                    {/* <Tabs key={1} variant={"underlined"} aria-label="Tabs PlanetView"> */}
                    {/* <Tab className='w-full' key="pl" title="Live"> */}
                    <Table aria-label="planet_quick_view" className='w-full h-[32rem]'>
                        <TableHeader>
                            <TableColumn>Planet</TableColumn>
                            <TableColumn>Liberation</TableColumn>
                            <TableColumn>Hourly</TableColumn>
                            <TableColumn>Players</TableColumn>
                            <TableColumn>Victory</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No rows to display."}>

                            {activePlanets.map(planet =>
                                <TableRow onClick={() => setContentVisible(!isContentVisible)} key={planet.index}>
                                    <TableCell>
                                        <div className='flex'>
                                            <div className='min-h-[20px] min-w-[20px] max-w-[20px] w-[20px] flex-grow float-left'>
                                                <Image src={planet.enemyFactionImage}
                                                    width={20}
                                                />
                                            </div>

                                            <div className='min-h-[20px] min-w-[20px] max-w-[20px] w-[20px] flex-grow float-left'>
                                                {(planet.hasEvent) ?
                                                    <Image src='/images/shield.svg'
                                                        width={20}
                                                    />
                                                    :
                                                    <Image src='/images/swords.svg'
                                                        width={20} />

                                                }
                                            </div>


                                            <span className='pl-2 flex-grow'>{planet.name}</span>

                                        </div>

                                    </TableCell>
                                    <TableCell>
                                        <CircularProgress
                                            aria-label={planet.name}
                                            size="lg"
                                            value={Number(planet.liberation.toFixed(2))}
                                            color="warning"
                                            formatOptions={{ style: "unit", unit: "percent" }}
                                            showValueLabel={true}
                                        />
                                    </TableCell>
                                    <TableCell>

                                        <p className='text-xs'>
                                            {(historical != undefined) ?
                                                <AnimatedNumber aria-label="regen"

                                                    value={
                                                        getDecayRate(planet.maxHealth, planet.status.regenPerSecond, planet.hasEvent, historical.find(h => h.campaignId == planet.campaign.id)?.progress)
                                                    }
                                                    className={
                                                        ((getDecayRate(planet.maxHealth, planet.status.regenPerSecond, planet.hasEvent, historical.find(h => h.campaignId == planet.campaign.id)?.progress) > 0) ? "text-green-400/80" : "text-red-400/80")
                                                    }
                                                    formatValue={formatValueDecay} duration={1100} />
                                                :
                                                <Skeleton className='h-full w-full'></Skeleton>
                                            }

                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex'>
                                            <span className='text-xs float-left font-bold'>
                                                <AnimatedNumber
                                                    aria-label="playerCount_qv"
                                                    value={planet.playerCount}
                                                    formatValue={formatValue}
                                                    duration={1100}
                                                />
                                            </span>
                                            <span className='text-xs flex-grow pl-2 '>
                                                <AnimatedNumber
                                                    aria-label="playerPercent_qv"
                                                    value={planet.playerCount}
                                                    formatValue={formatPlayerPercent}
                                                    duration={1100}
                                                />
                                            </span>
                                        </div>
                                        {/* {(planet.hasEvent) ?
                                            <>
                                                <Image src='/images/shield.svg'
                                                    width={20}
                                                    className='absolute'
                                                />

                                                <p className='pl-6'>Defense</p>
                                            </>
                                            :
                                            <>
                                                <Image src='/images/swords.svg'
                                                    width={20}
                                                    className='absolute' />
                                                <p className='pl-6'>Liberation</p>
                                            </>
                                        } */}
                                    </TableCell>
                                    <TableCell>

                                        {
                                            // @ts-ignore: Object is possibly 'null'.
                                            ((victoryMap?.get(planet.index) - apiStatus.status.time) < 864000 && (victoryMap?.get(planet.index) - apiStatus.status.time > 0)) ?
                                            <CountdownTimer className='text-tiny flex'
                                                classNames={{
                                                    span: "flex-grow pr-[2px]"
                                                }}
                                                currentTime={apiStatus.status.time}
                                                endTime={victoryMap?.get(planet.index)} />
                                                :
                                                <p className='text-tiny text-gray-600'>Victory Unknown</p>
                                        }

                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>
                    </Table>

                    <div className='pt-5 flex flex-wrap items-start justify-center'>
                        <Popover placement="top">
                            <PopoverTrigger>
                                <Button className="float-right" color="success" variant='light'>What&apos;s the priority?</Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[320px]'>
                                <div className="px-1 py-2">
                                    <div className="text-medium font-bold">How is this list sorted and what is the priority?</div>
                                    {(activePlanets != undefined && activePlanets.length > 0) &&
                                        <Chip className="float-right -mt-5 mb-2" variant="flat" color="success">{activePlanets[0].name}</Chip>
                                    }

                                    <Divider className='my-2' />
                                    <div className="text-small">
                                        <p className='pt-2'>
                                            The planets in this view are sorted and prioritized based on a handful of different criteria
                                            to help weigh a planets importance to the overall war efforts.
                                            <br />
                                            <br />
                                            The following are some of the factors that determine a planets impact on the war.
                                        </p>
                                        <Divider className='my-3' />
                                        <ul>
                                            <li>Is the planet an objective in the MO (Major Order)?</li>
                                            <li>Does the planet share a supply line with a planet in the MO?</li>
                                            <li>Does the planet share a tertiary supply line with a plannet connected to an MO objective?</li>
                                            <li>If it is a tertiary planet, how many hops from a main objective?</li>
                                            <li>Is there an active event on the planet, such as a Defense Campaign?</li>
                                            <li>If there is an active event, is it against the same enemy that the MO is targeting?</li>
                                            <li>What is the liberation percentage?</li>
                                            <li>And more.</li>
                                        </ul>
                                        <Divider className='my-3' />
                                        <p>
                                            With this, the impact weight of all the active planets starts to take the shape of a tree.
                                            The planets located on the furthest branches/nodes of the tree have less impact to the current efforts than those at the top of the list and in the Main Objectives section.
                                        </p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {/* </Tab>

                        <Tab title="History">

                        </Tab>
                    </Tabs> */}

                </CardBody>
            </Card>
        </div>
    )
}


export default PlanetQuickView