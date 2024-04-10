import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tab, Tabs, Chip, Tooltip } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import { TrendChart } from './trendChart'
import { GalaxyStatus } from '@/app/types/api/helldivers/galaxy_status_types'
import { WarInfo } from '@/app/types/api/helldivers/war_info_types'
import { Assignment } from '@/app/types/api/helldivers/assignment_types'
import useSWR from 'swr'
import { fetcher } from '@/app/classes/fetch'
import PlanetStats from './planetStats'
import AnimatedNumber from "animated-number-react";
import { ChartData } from './interfaces'
import MultihitChip from '../multihit_chip'




function MajorOrderStats(props: { war: { status: GalaxyStatus, info: WarInfo, campaignWaypoints: { planetIndex: number, planetName: string, campaignId: number; waypoints: any; }[] }, assignment: Assignment }) {

  //TODO: Need to be able to keep a permenant record of associated planets via waypoints before I can add more tabs
  // const [planetTabs, setPlanetTabs] = useState<{ name: string, index: number }[]>();
  const [enemy, setEnemy] = useState(0);
  const [assignment, setAssignment] = useState(props.assignment);

  const [missionsWon, setmissionsWon] = useState(0);
  const [missionsLost, setmissionsLost] = useState(0);
  const [kills, setKills] = useState(0);
  const [bulletsFired, setbulletsFired] = useState(0);
  const [bulletsHit, setbulletsHit] = useState(0);
  const [deaths, setdeaths] = useState(0);

  const reqHistory = (useSWR("/api/historical/stats/" + props.assignment.id32, fetcher, { refreshInterval: 1800000 })).data

  const [historicalStats, setHistoricalStats] = useState<ChartData>();

  useEffect(() => {
    if (props.assignment != undefined && reqHistory != undefined && props.war != undefined) {
      setAssignment(props.assignment)

      const taskSet = new Set();
      props.assignment.setting.tasks.forEach(element => {
        taskSet.add(element.planetIndex)
      });


      let factionID = props.assignment.enemyID;
      setEnemy(factionID)
      // if (props.assignment.setting.overrideBrief.toLowerCase().includes("automaton")) {
      //   setEnemy(3)
      //   factionID = 3
      // } else if (props.assignment.setting.overrideBrief.toLowerCase().includes("terminid")) {
      //   setEnemy(2)
      //   factionID = 2
      // }

      let kills = 0
      if (factionID == 3) {
        kills = reqHistory[reqHistory.length - 1].automatonKills - reqHistory[0].automatonKills
      } else {
        kills = reqHistory[reqHistory.length - 1].bugKills - reqHistory[0].bugKills
      }

      setmissionsWon(reqHistory[reqHistory.length - 1].missionsWon - reqHistory[0].missionsWon)
      setmissionsLost(reqHistory[reqHistory.length - 1].missionsLost - reqHistory[0].missionsLost)
      setKills(kills)

      const bf = (reqHistory[reqHistory.length - 1].bulletsFired - reqHistory[0].bulletsFired)
      let bh = Math.floor((reqHistory[reqHistory.length - 1].accurracy / 100) * bf)
      if (reqHistory[reqHistory.length - 1].accurracy == 100) {
        bh = (reqHistory[reqHistory.length - 1].bulletsHit - reqHistory[0].bulletsHit)
      }
      setbulletsFired(bf)
      setbulletsHit(bh)

      setdeaths(reqHistory[reqHistory.length - 1].deaths - reqHistory[0].deaths)



      let tmpTrend: ChartData = {
        missionSuccessRate: [],
        deaths: [],
        revives: [],
        missionsWon: [],
        timePlayed: [],
        automatonKills: [],
        illuminateKills: [],
        missionsLost: [],
        bulletsFired: [],
        friendlies: [],
        bulletsHit: [],
        accurracy: [],
        bugKills: [],
        missionTime: []
      };


      for (let i = 1; i < reqHistory.length; i++) {

        tmpTrend.deaths.push({ value: reqHistory[i].deaths - reqHistory[i - 1].deaths, created: reqHistory[i].created })
        tmpTrend.missionsWon.push({ value: reqHistory[i].missionsWon - reqHistory[i - 1].missionsWon, created: reqHistory[i].created })
        tmpTrend.automatonKills.push({ value: reqHistory[i].automatonKills - reqHistory[i - 1].automatonKills, created: reqHistory[i].created })
        tmpTrend.missionsLost.push({ value: reqHistory[i].missionsLost - reqHistory[i - 1].missionsLost, created: reqHistory[i].created })
        tmpTrend.bulletsFired.push({ value: reqHistory[i].bulletsFired - reqHistory[i - 1].bulletsFired, created: reqHistory[i].created })
        tmpTrend.bulletsHit.push({ value: reqHistory[i].bulletsHit - reqHistory[i - 1].bulletsHit, created: reqHistory[i].created })
        tmpTrend.bugKills.push({ value: reqHistory[i].bugKills - reqHistory[i - 1].bugKills, created: reqHistory[i].created })

      }

      setHistoricalStats(tmpTrend)

      //   let tmpTabs: { name: string, index: number }[] = []
      //   //set planet tabs
      //   props.war.campaignWaypoints.forEach(element => {
      //     element.waypoints.forEach((waypoint: number) => {
      //       if (taskSet.has(waypoint)) {
      //         tmpTabs.push({ name: element.planetName, index: element.planetIndex })
      //       }
      //     });
      //   });

      //   setPlanetTabs(tmpTabs)
    }


  }, [props, reqHistory])


  const formatValue = (value: number) => {
    return value.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true })
  };

  return (
    <div>

      <div className="flex flex-wrap gap-4 pt-3">

        {/* <Tabs key={1} variant={"underlined"} aria-label="Tabs variants">
          <Tab className='w-full' key="galaxy" title="Galaxy"> */}

            <Table aria-label="statsTable">
              <TableHeader>
                <TableColumn>Stat</TableColumn>
                <TableColumn>Value</TableColumn>
                <TableColumn>Trend</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow key="1">
                  <TableCell>Missions Won</TableCell>
                  <TableCell><AnimatedNumber aria-label="missionsLost" value={missionsWon} formatValue={formatValue} duration={1100} /></TableCell>
                  <TableCell><TrendChart dataArray={historicalStats?.missionsWon} /></TableCell>
                </TableRow>
                <TableRow key="2">
                  <TableCell>Missions Lost</TableCell>
                  <TableCell><AnimatedNumber aria-label="missionsLost" value={missionsLost} formatValue={formatValue} duration={1100} /></TableCell>
                  <TableCell><TrendChart dataArray={historicalStats?.missionsLost} /></TableCell>
                </TableRow>
                <TableRow key="3">
                  <TableCell>{(enemy == 2) ? "Terminid Kills" : "Automaton Kills"}</TableCell>
                  <TableCell><AnimatedNumber aria-label="kills" value={kills} formatValue={formatValue} duration={1100} /></TableCell>
                  <TableCell><TrendChart dataArray={(enemy == 2) ? historicalStats?.bugKills : historicalStats?.automatonKills} /></TableCell>
                </TableRow>
                <TableRow key="4">
                  <TableCell>Bullets Fired</TableCell>
                  <TableCell><AnimatedNumber aria-label="bulletsFired" value={bulletsFired} formatValue={formatValue} duration={1100} /></TableCell>
                  <TableCell><TrendChart dataArray={historicalStats?.bulletsFired} /></TableCell>
                </TableRow>
                <TableRow key="5">
                  <TableCell>Bullets Hit <MultihitChip /></TableCell>
                  <TableCell><AnimatedNumber aria-label="bulletsHit" value={bulletsHit} formatValue={formatValue} duration={1100} /></TableCell>
                  <TableCell><TrendChart dataArray={historicalStats?.bulletsHit} /></TableCell>
                </TableRow>
                <TableRow key="6">
                  <TableCell>Deaths</TableCell>
                  <TableCell><AnimatedNumber aria-label="deaths" value={deaths} formatValue={formatValue} duration={1100} /></TableCell>
                  <TableCell><TrendChart dataArray={historicalStats?.deaths} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>

          {/* </Tab>

          {(assignment != undefined) &&
            assignment.setting.tasks.map((task) => (
              <Tab className='w-full' key={task.planetIndex} title={task.planetName}>
                <PlanetStats enemy={enemy} assignment={assignment} planetIndex={task.planetIndex} planetName={task.planetName} />
              </Tab>
            ))
          } */}

          {/* {(planetTabs != undefined) &&
            planetTabs.map((planet) => (
              <Tab className='w-full' key={planet.index} title={planet.name}>
                <PlanetStats planetIndex={task.planetIndex} planetName={task.planetName} />
              </Tab>
            ))
          } */}

        {/* </Tabs> */}

      </div>


    </div>
  )
}

function getRaised(oldVal: number, newVal: number, size: number) {
  let difference = newVal - oldVal;
  let growth = difference * (1/size)-1
  console.log(growth)
  //let growth = absolute / avg

  return newVal * growth
}

export default MajorOrderStats