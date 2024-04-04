"use client"
import './atAGlance.scss'
import React, { useEffect, useState } from 'react'
import MajorOrderCard from './majorOrder'
import GalaxyStatsCard from './galaxyStats'
import PlanetQuickView from './planetQuickView'
import { Accordion, AccordionItem, Spinner } from '@nextui-org/react'
import useSWR from 'swr'
import { fetcher } from '@/app/classes/fetch'
import { Assignment } from '@/app/types/api/helldivers/assignment_types'
import moment from 'moment'

const timeAgo = moment().subtract(24, 'hour').toDate().getTime()

function Overview() {

    const [assignment, setAssignment] = useState<Assignment>()
    const majorOrder = useSWR("/api/status/orders", fetcher, { refreshInterval: 20000 }).data;
    const [time, setTime] = useState(timeAgo);
    //console.log(majorOrder);

    useEffect(() => {
        if (majorOrder != undefined) {
            setAssignment(majorOrder)
        }


        const interval = setInterval(() => {
            setTime(timeAgo)
        }, 600000);

        return () => clearInterval(interval);

    }, [majorOrder])

    //TODO: Make all accordions a single one
    return (
        <div className='py-2'>

            <div className='pt-8 gap-10 w-full h-auto flex flex-wrap items-start justify-center'>

                {(assignment != undefined) ?
                    <>
                        <GalaxyStatsCard time={time} majorOrder={assignment} className='w-[27rem]' />
                        <MajorOrderCard majorOrder={assignment} className='w-[35rem]' />
                        <PlanetQuickView majorOrder={assignment} className='w-[27rem]' />
                    </>
                    : <Spinner color='default' />}




            </div>

        </div>
    )
}

export default Overview