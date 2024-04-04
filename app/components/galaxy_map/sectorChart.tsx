"use client"
import React, { useEffect, useState } from 'react'
import { Image } from "@nextui-org/react";
import useSWR from 'swr';
import { fetcher } from '@/app/classes/fetch';
import { PlanetsAPI, StatusAPI } from '@/app/types/app_types';
import Planet from '@/app/classes/planet';



function SectorChart(props: { warData?: StatusAPI }) {
    const [planets, setPlanets] = useState<Planet[]>();

    const apiPlanets: PlanetsAPI[] = useSWR("/api/planets", fetcher, { refreshInterval: 20000 }).data;
    const apiStatus: StatusAPI = useSWR("/api/status", fetcher, { refreshInterval: 20000 }).data;
    const majorOrder = useSWR("/api/status/orders", fetcher, { refreshInterval: 20000 }).data;


    useEffect(() => {
        if (apiStatus != undefined && apiPlanets != undefined && majorOrder != undefined) {

            let tmp: Planet[] = [new Planet(majorOrder, {count: 0, id: 0, planetIndex: 0, type: 0}, apiStatus)];
            apiStatus.status.campaigns.forEach(campaign => {
                let planet = new Planet(majorOrder, campaign, apiStatus, apiPlanets);
                tmp.push(planet)
            });


            setPlanets(tmp);

        }
    }, [apiStatus, apiPlanets, majorOrder]);

    //TODO: not important this minute, but add a onLoad check for adding the data point AFTER the image has been fully loaded
    return (
        <div className='map'>
            <div className='container'>

                <Image
                    src="/images/sectormap_mine.svg"
                    alt="Map"
                    width={600}
                    height={600}
                    style={{ marginLeft: "0.10rem", marginBottom: "0.3rem" }}
                    className="relative opacity-60 text-center smphone:mt-1"
                />

                {(planets != undefined) ?

                    <div className='scatterChart'>
                        {planets.map(planet =>
                            // <Tooltip content={planet.name}>
                            <div key={planet.info.index} className={((planet.info.position.x == 0 && planet.info.position.y == 0) ? 'superearth-location blink' : 'planet-location blink') + ' smphone:ml-[0.0625rem] phone:ml-0'} style={{ left: mapValue(planet.info.position.x, -1, 1, 0, 100) + '%', top: mapValue(planet.info.position.y, -1, 1, 100, 0) + '%' }}>
                                <span></span>
                            </div>
                            // </Tooltip>
                        )}
                    </div>
                    :
                    <></>
                }

            </div>

        </div>
    )
}

function mapValue(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
    return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}

export default SectorChart