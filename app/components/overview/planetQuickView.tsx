"use client"
import { fetcher } from '@/app/classes/fetch';
import Planet from '@/app/classes/planet';
import { Assignment } from '@/app/types/api/helldivers/assignment_types';
import { PlanetsAPI, StatusAPI } from '@/app/types/app_types';
import { sortPlanets } from '@/app/utilities/client_functions';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, CardHeader, CardBody, Image, Divider, CircularProgress, Spinner, CardFooter, Button, Popover, PopoverContent, PopoverTrigger, Tab, Tabs, Chip } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr';

function PlanetQuickView(props: { majorOrder: Assignment, className?: string }) {


    const [activePlanets, setActivePlanets] = useState<Planet[]>([]);
    const apiStatus: StatusAPI = useSWR("/api/status", fetcher, { refreshInterval: 20000 }).data;
    const apiPlanets: PlanetsAPI[] = useSWR("/api/planets", fetcher, { refreshInterval: 20000 }).data;

    useEffect(() => {
        if (apiStatus != undefined && apiPlanets != undefined && props.majorOrder != undefined) {
            let tmpPlanets: Planet[] = []
            for (let i = 0; i < apiStatus.status.campaigns.length; i++) {

                let campaign = apiStatus.status.campaigns[i];


                let p = new Planet(props.majorOrder, campaign, apiStatus, apiPlanets);
                tmpPlanets.push(p)

            }

            sortPlanets(tmpPlanets, true)
            setActivePlanets(tmpPlanets)
        }
    }, [apiStatus, apiPlanets, props.majorOrder]);




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
                            <Table aria-label="Example static collection table">
                                <TableHeader>
                                    <TableColumn>Planet</TableColumn>
                                    <TableColumn>Type</TableColumn>
                                    <TableColumn>Liberation</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent={"No rows to display."}>

                                    {activePlanets.map(planet =>
                                        <TableRow key={planet.index}>
                                            <TableCell>
                                                <>

                                                    <Image src={planet.enemyFactionImage}
                                                        width={20}
                                                        className='absolute'
                                                    />

                                                    <p className='pl-6'>{planet.name}</p>
                                                </>


                                            </TableCell>
                                            <TableCell>{(planet.hasEvent) ?
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
                                            }</TableCell>
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