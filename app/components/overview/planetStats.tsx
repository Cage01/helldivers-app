import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr';
import { Assignment } from '@/app/types/api/helldivers/assignment_types';
import AnimatedNumber from "animated-number-react";
import { fetcher } from '@/app/classes/fetch';



function PlanetStats(props: { planetIndex: number, planetName: string, assignment: Assignment, enemy: number }) {

    const [missionsWon, setMissionsWon] = useState(0);
    const [missionsLost, setMissionsLost] = useState(0);
    const [kills, setKills] = useState(0);
    const [bulletsFired, setbulletsFired] = useState(0);
    const [bulletsHit, setbulletsHit] = useState(0);
    const [deaths, setdeaths] = useState(0);
    const [hasData, setHasData] = useState(false);

    const planetStats = (useSWR("/api/status/stats/" + props.planetIndex + "?globalEventId=" + props.assignment.id32, fetcher, {refreshInterval:1800000 })).data
    
    useEffect(() => {
        if (planetStats != undefined) {
            console.log(planetStats)
            if (planetStats.length > 0) {
                if (!hasData) {
                    setHasData(true)
                }

                planetStats.forEach((element: { last: { missionsWon: number; missionsLost: number; automatonKills: number; bugKills: number; bulletsFired: number; accurracy: number; bulletsHit: number; deaths: number; }; first: { missionsWon: number; missionsLost: number; automatonKills: number; bugKills: number; bulletsFired: number; bulletsHit: number; deaths: number; }; }) => {
                    setMissionsWon(missionsWon + (element.last.missionsWon - element.first.missionsWon))
                    setMissionsLost(missionsWon + (element.last.missionsLost - element.first.missionsLost))

                    if (props.enemy == 3) {
                        setKills(kills + (element.last.automatonKills - element.first.automatonKills))
                    } else if (props.enemy == 2) {
                        setKills(kills + (element.last.bugKills - element.first.bugKills))
                    }

                    const bf = (element.last.bulletsFired - element.first.bulletsFired)
                    const bh = Math.floor((element.last.accurracy / 100) * bf)
                    setbulletsFired(bf)
                    setbulletsHit(bh)

                    setbulletsFired(bulletsFired + (element.last.bulletsFired - element.first.bulletsFired))
                    setbulletsHit(bulletsHit + (element.last.bulletsHit - element.first.bulletsHit))
                    setdeaths(deaths + (element.last.deaths - element.first.deaths))
                });
            }

        }

    }, [planetStats])

    const formatValue = (value: number) => {
        console.log("error format " + value)
        return value.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true })
    };

    return (
        <Table>
            <TableHeader>
                <TableColumn>Stat</TableColumn>
                <TableColumn>Value</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No campaign data yet."}>
                {hasData ?
                    <>
                        <TableRow key="1">
                            <TableCell>Missions Won</TableCell>
                            <TableCell><AnimatedNumber aria-label="missionsLost" value={missionsWon} formatValue={formatValue} duration={1100} /></TableCell>
                        </TableRow>
                        <TableRow key="2">
                            <TableCell>Missions Lost</TableCell>
                            <TableCell><AnimatedNumber aria-label="missionsLost" value={missionsLost} formatValue={formatValue} duration={1100} /></TableCell>
                        </TableRow>
                        <TableRow key="3">
                            <TableCell>{(props.enemy == 2) ? "Terminid Kills" : "Automaton Kills"}</TableCell>
                            <TableCell><AnimatedNumber aria-label="kills" value={kills} formatValue={formatValue} duration={1100} /></TableCell>
                        </TableRow>
                        <TableRow key="4">
                            <TableCell>Bullets Fired</TableCell>
                            <TableCell><AnimatedNumber aria-label="bulletsFired" value={bulletsFired} formatValue={formatValue} duration={1100} /></TableCell>
                        </TableRow>
                        <TableRow key="5">
                            <TableCell>Bullets Hit</TableCell>
                            <TableCell><AnimatedNumber aria-label="bulletsHit" value={bulletsHit} formatValue={formatValue} duration={1100} /></TableCell>
                        </TableRow>
                        <TableRow key="6">
                            <TableCell>Deaths</TableCell>
                            <TableCell><AnimatedNumber aria-label="deaths" value={deaths} formatValue={formatValue} duration={1100} /></TableCell>
                        </TableRow>
                    </>
                    : []}

            </TableBody>
        </Table>


    )
}

export default PlanetStats