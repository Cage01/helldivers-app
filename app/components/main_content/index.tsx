"use client"
import { Accordion, AccordionItem, Spinner } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import Overview from '../overview'
import PlanetContainer from '../planet_container'
import { MajorOrderAssociation } from '@/app/classes/enums'
import { fetcher } from '@/app/classes/fetch'
import Planet from '@/app/classes/planet'
import { Assignment } from '@/app/types/api/helldivers/assignment_types'
import { PlanetsAPI, StatusAPI } from '@/app/types/app_types'
import { sortPlanets } from '@/app/utilities/universal_functions'
import useSWR from 'swr'

function MainContent() {
    const [mainObjectives, setMainObjectives] = useState<Planet[]>();
    const [secondaryObjectives, setSecondaryObjectives] = useState<Planet[]>();

    const apiPlanets: PlanetsAPI[] = (useSWR("/api/planets", fetcher, { refreshInterval: 20000 })).data;
    const apiStatus: StatusAPI = (useSWR("/api/status", fetcher, { refreshInterval: 20000 })).data;
    const majorOrder: Assignment = (useSWR("/api/status/orders", fetcher, { refreshInterval: 1800000 })).data;



    useEffect(() => {
        if (apiPlanets != undefined && apiStatus != undefined && majorOrder != undefined) {
            const assignment: Assignment = majorOrder

            let assignmentEnemy = 0
            if (assignment.setting.overrideBrief.toLowerCase().includes("automaton")) {
                assignmentEnemy = 3
            } else if (assignment.setting.overrideBrief.toLowerCase().includes("terminid")) {
                assignmentEnemy = 2
            }

            let allPlanets: Planet[] = [];
            let tmpMain: Planet[] = [];
            let tmpSecondary: Planet[] = [];

            for (let i = 0; i < apiStatus.status.campaigns.length; i++) {
                let campaign = apiStatus.status.campaigns[i];


                let p = new Planet(majorOrder, campaign, apiStatus, apiPlanets);
                allPlanets.push(p);


            }
            sortPlanets(majorOrder, allPlanets, true);

            allPlanets.forEach((planet, index) => {
                if (planet.majorOrderAssociation == MajorOrderAssociation.mainObjective) {
                    tmpMain.push(planet)
                }
                else if (index < ((allPlanets.length / 2) - 1) && tmpMain.length < 3) {
                    tmpMain.push(planet)
                } else {
                    tmpSecondary.push(planet)
                }
                // if (planet.majorOrderAssociation == MajorOrderAssociation.mainObjective || (planet.hasEvent && planet.enemyFactionID == assignmentEnemy)) {
                //     tmpMain.push(planet);
                // } else if (planet.majorOrderAssociation == MajorOrderAssociation.associated
                //     && (!tmpMain.some((e) => e.majorOrderAssociation == MajorOrderAssociation.mainObjective) && (tmpMain.length < 2))) {

                //     tmpMain.push(planet)
                // } else if (planet.majorOrderAssociation == MajorOrderAssociation.tertiary
                //     && (!tmpMain.some((e) => e.majorOrderAssociation >= MajorOrderAssociation.associated) && (planet.liberation > 0 && tmpMain.length < 2))) {

                //     tmpMain.push(planet)
                // } else {
                //     tmpSecondary.push(planet)
                // }
            });

            sortPlanets(majorOrder, tmpMain, true);
            sortPlanets(majorOrder, tmpSecondary, true);
            //console.log(tmpSecondary)

            if (tmpMain.length == 0) {
                let split = splitArrayByIndex(tmpSecondary, 1)
                if (split != undefined) {
                    tmpMain = split[0] as Planet[]
                    tmpSecondary = split[1] as Planet[]
                }

            } else if (tmpSecondary.length == 0) {
                let split = splitArrayByIndex(tmpMain, 1)
                if (split != undefined) {
                    tmpMain = split[0] as Planet[]
                    tmpSecondary = split[1] as Planet[]
                }

            }
            setMainObjectives(tmpMain)
            setSecondaryObjectives(tmpSecondary)
        }


    }, [apiPlanets, apiStatus, majorOrder]);



    return (
        <Accordion keepContentMounted={true} variant='bordered' selectionMode="multiple" defaultExpandedKeys={["1", "2", "3"]}>

            {/*======== OVERVIEW ======== */}
            <AccordionItem key="1" className="pb-5"
                classNames={{
                    startContent: "flex-shrink w-full",
                    titleWrapper: "flex-shrink"
                }} startContent={
                    <div className='w-full px-5'>
                        <div className='text-center objectives'>Overview</div>
                        <p className='text-center text-sm pt-2 text-gray-600'>Press to expand a quick summary of the galactic status.</p>
                    </div>
                }>

                <Overview />

            </AccordionItem>

            {/*======== PRIMARY OBJECTIVES ======== */}
            <AccordionItem key="2" className="pb-5"
                classNames={{
                    startContent: "flex-shrink w-full",
                    titleWrapper: "flex-shrink"
                }}
                startContent={
                    <div className='w-full px-5'>
                        <div className='text-center objectives'>Main Objectives</div>
                        <p className='text-center text-sm pt-2 text-gray-600'>Press to expand a list of currently active planets that are high priority.</p>

                    </div>
                }>
                <div className="pt-8 gap-2 w-full h-auto flex flex-wrap items-start justify-center ">
                    {(mainObjectives != undefined)
                        ? mainObjectives.map(planet =>
                            <PlanetContainer key={planet.index + "_planet"} planetStats={planet} />
                        ) : <Spinner color="default" />}
                </div>
            </AccordionItem>
            {/*==================================== */}

            {/*======== SECONDARY OBJECTIVES ======== */}
            <AccordionItem textValue="" className="pb-5" key="3"
                classNames={{
                    startContent: "flex-shrink w-full",
                    titleWrapper: "flex-shrink"
                }} startContent={
                    <div className='w-full px-5'>
                        <div className='text-center objectives'>Secondary Objectives</div>
                        <p className='text-center text-sm pt-2 text-gray-600'>Press to expand a list of other currently active planets.</p>

                    </div>
                }>
                <div className="pt-8 gap-2 w-full h-auto flex flex-wrap items-start justify-center">
                    {(secondaryObjectives != undefined)
                        ? secondaryObjectives.map(planet =>
                            <PlanetContainer key={planet.index + "_planetZero"}
                                planetStats={planet} />
                        ) : <Spinner color="default" />}
                </div>
            </AccordionItem>
            {/*==================================== */}

        </Accordion>
    )
}

function splitArrayByIndex(arr: string | any[], index: number) {
    if (index > 0 && index < arr.length) {
        return [arr.slice(0, index), arr.slice(-1 * (arr.length - index))]
    }
}

export default MainContent