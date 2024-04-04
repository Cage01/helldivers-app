import { Table, TableHeader, TableColumn, TableBody, TableCell, TableRow } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import { TrendChart } from '../trend_chart'
import AnimatedNumber from "animated-number-react";
import useSWR from 'swr';
import { fetcher } from '@/app/classes/fetch';


function PlanetStats(props: { campaignID: number, planetID: number }) {
    //const progress = useSWR("/api/historical?planetID=" + props.planetID + "&campaignID=" + props.campaignID + "&hours=48", fetcher, { refreshInterval: 60000 }).data;
    //const [historicalStats, setHistoricalStats] = useState<ChartData>()

    const reqStats = useSWR("/api/status/stats", fetcher, { refreshInterval: 20000 }).data
    //const [stats, setStats] = useState<Stats>()
    const [statBlock, setStatBlock] = useState<any>()
    // const [missionsWon, setmissionsWon] = useState(0);
    // const [missionsLost, setmissionsLost] = useState(0);
    // const [bugKills, setbugKills] = useState(0);
    // const [automatonKills, setautomatonKills] = useState(0);
    // const [bulletsFired, setbulletsFired] = useState(0);
    // const [bulletsHit, setbulletsHit] = useState(0);
    // const [timePlayed, settimePlayed] = useState(0);
    // const [deaths, setdeaths] = useState(0);
    // const [friendlies, setfriendlies] = useState(0);

    useEffect(() => {
        if (reqStats != undefined) {
            //setHistoricalStats(progress)
            //setStats(reqStats)
            reqStats.planets_stats.forEach((element: any) => {
                if (element.planetIndex == props.planetID) {
                    console.log(element)
                    setStatBlock(element)
                }
            });
            //setStatBlock(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID))
            // setmissionsWon(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).missionsWon)
            // setmissionsLost(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).missionsLost)
            // setbugKills(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).bugKills)
            // setautomatonKills(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).automatonKills)
            // setbulletsFired(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).bulletsFired)
            // setbulletsHit(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).bulletsHit)
            // settimePlayed(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).timePlayed)
            // setdeaths(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).deaths)
            // setfriendlies(reqStats.planets_stats.find((p: PlanetStatBlock) => p.planetIndex == props.planetID).friendlies)

        }
    }, [reqStats])


    const formatValue = (value: number) => {
        return value.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true })
    };

    const formatTime = (value: number) => {
        return (value / 31556952).toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true }) + " Years"
    }

    return (
        <Table removeWrapper aria-label="Example empty table">
            <TableHeader>
                <TableColumn>Stat</TableColumn>
                <TableColumn>Value</TableColumn>
            </TableHeader>

            <TableBody emptyContent={"No rows to display."}>
                {(statBlock != undefined) ?
                    <>
                        <TableRow key="1">
                            <TableCell>Missions Won</TableCell>
                            <TableCell>{statBlock.missionsWon}</TableCell>
                        </TableRow>

                    </>
                    : []}



            </TableBody>
        </Table>
    )
}

export default PlanetStats