"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import './planetStatus.css';
import { Card, CardHeader, CardBody, Image, Progress, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Divider, Tooltip, CircularProgress, CardFooter } from "@nextui-org/react";
import CountdownTimer from '@/app/components/countdown';
import CardLineChart from './cardLineChart';
import * as htmlToImage from 'html-to-image';
import moment from 'moment';
import Planet from '@/app/classes/planet';
import useSWR from 'swr';
import { FCampaignProgress } from '@/app/types/firebase_types';
import { fetcher } from '@/app/classes/fetch';
import AnimatedNumber from "animated-number-react";
import PlanetStats from './planetStats';
import { getDecayRate } from '@/app/utilities/client_functions';
import { HistoricalAPI } from '@/app/types/app_types';


const neutral: string = "/images/neutral_icon.svg"
const positive: string = "/images/up_arrows.svg"
const negative: string = "/images/down_arrows.svg"

function PlanetContainer(props: { planetStats: Planet }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  var hasEvent: boolean = false;
  var endTime: number = 0;

  //console.log(endTime)


  if (props.planetStats.hasEvent && props.planetStats.event?.expireTime != undefined) {

    endTime = props.planetStats.event.expireTime
    hasEvent = true
  }

  const ref = useRef<HTMLDivElement>(null)

  const getImage = useCallback(() => {
    if (ref.current === null) {
      return
    }

    htmlToImage.toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {

        const link = document.createElement('a')
        link.download = props.planetStats.name + "_" + moment(new Date()).format("MMDDYYhhmmss") + '.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [ref])



  const [id, setId] = useState(props.planetStats.campaign.id);
  const [planetID, setPlanetID] = useState(props.planetStats.index);
  const [playerCount, setPlayerCount] = useState(props.planetStats.playerCount);
  const [liberation, setLiberation] = useState(props.planetStats.liberation);
  const [prevLiberation, setPrevLiberation] = useState(props.planetStats.liberation);
  const [decayRate, setDecayRate] = useState(0);
  const [trend, setTrend] = useState(neutral);
  const [victoryPrediction, setVictoryPrediction] = useState<number>();
  const [firstLoad, setFirstLoad] = useState(true)

  const history: HistoricalAPI[] = useSWR("/api/historical?planetID=" + props.planetStats.index + "&campaignID=" + props.planetStats.campaign.id + "&hours=1", fetcher, { refreshInterval: 600000 }).data;

  //console.log(victoryPrediction)
  //console.log("=======")
  useEffect(() => {
    if (history != undefined) {
      
      //console.log(history)
      let tmpDecay = getDecayRate(props.planetStats.maxHealth, props.planetStats.status.regenPerSecond, props.planetStats.hasEvent, history[0].progress);
      if (decayRate != tmpDecay) {
        setDecayRate(Number(tmpDecay.toLocaleString('en', { maximumFractionDigits: 3 })))

        //Update prediction
        let prd = Math.ceil(Math.max(((100 - props.planetStats.liberation) / tmpDecay), 0) * 60 * 60) + props.planetStats.time
        setVictoryPrediction(prd);

        if (firstLoad) {
          if (tmpDecay > 0) {
            setTrend(positive)
          } else if (tmpDecay < 0 && props.planetStats.liberation > 0) {
            setTrend(negative)
          } else if (props.planetStats.liberation <= 0) {
            setTrend(neutral)
          }

          setFirstLoad(false)
        }
      }
    }
  }, [history])

  useEffect(() => {

    //console.log(firstLoad)
    if (props.planetStats.campaign.id != id) {
      setId(props.planetStats.campaign.id)
    }

    if (props.planetStats.index != planetID) {
      setPlanetID(props.planetStats.index)
    }

    if (playerCount != props.planetStats.playerCount) {
      setPlayerCount(props.planetStats.playerCount)
    }

    if (liberation != props.planetStats.liberation) {
      setPrevLiberation(liberation)
      setLiberation(props.planetStats.liberation)
    }


    if (!firstLoad) {
      //Setting icons based on liberation status. Also presetting positive icon for planets with liberation > 0 on first load
      if (props.planetStats.liberation > prevLiberation && trend != positive) {

        setTrend(positive)
        // console.log("running + on " + props.planetStats.name)
      } else if (props.planetStats.liberation < prevLiberation && trend != negative) {
        setTrend(negative)
        // console.log("running - on " + props.planetStats.name)
      } else if (props.planetStats.liberation == prevLiberation && trend != neutral) {
        setTrend(neutral)
        // console.log("running / on " + props.planetStats.name)
      }
    }




    //setFirstLoad(false)

  }, [props])


  const formatValue = (value: number) => {
    return value.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true })
  };

  const formatDecay = (value: number) => {
    return value.toLocaleString("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  };

  return (
    <>
      <Card className="py-4 min-w-48 max-w-56" isPressable onPress={onOpen}>
        <CardHeader className="pb-0 pt-2 px-4 flex-col ">
          <div className='flex' style={{ width: "100%" }}>
            <Image
              alt='Faction'
              src={props.planetStats.enemyFactionImage}
              width={43}
              style={{ top: "-22px", left: "-10px", zIndex: "5", float: "left" }}
            />
            <div className='float-right flex-grow -mt-4'>
              <h5 className='text-xs float-right'><AnimatedNumber aria-label="bugKills" value={playerCount} formatValue={formatValue} duration={1100} /> Players</h5>
            </div>

          </div>

          <Image
            alt="Card background"
            className="object-cover rounded-xl"
            src={props.planetStats.image}
            style={{ display: "inline", position: "relative", marginTop: "-30px" }}
            width={250}
          />

          <div className='absolute mt-40 ml-32'>

            <Image
              alt="Shield"
              src={(props.planetStats.hasEvent) ? "/images/shield.svg" : "/images/swords.svg"}
              width={40}
            />

          </div>

        </CardHeader>



        <CardBody className="overflow-visible py-2">

          {trend == positive &&
            <Tooltip content="Realtime liberation compared to the previous value 20 seconds ago" showArrow={true} placement='left'>
              <Image
                alt="impact"
                className="object-cover rounded-xl -ml-1"

                loading='eager'
                src={positive}
                style={{ display: "inline", position: "relative", marginTop: "-30px", opacity: "0.58" }}
                width={30}
                height={40}
              />
            </Tooltip>
          }


          {trend == negative &&
            <Tooltip content="Realtime liberation compared to the previous value 20 seconds ago" showArrow={true} placement='left'>
              <Image
                alt="impact"
                className="object-cover rounded-xl -ml-1"

                loading='eager'
                src={negative}
                style={{ display: "inline", position: "relative", marginTop: "-30px", opacity: "0.58" }}
                width={30}
                height={40}
              />
            </Tooltip>
          }

          {trend == neutral &&
            <Tooltip content="Realtime liberation compared to the previous value 20 seconds ago" showArrow={true} placement='left'>
              <Image
                alt="impact"
                className="object-cover rounded-xl -ml-1"

                loading='eager'
                src={neutral}
                style={{ display: "inline", position: "relative", marginTop: "-30px", opacity: "0.58" }}
                width={30}
                height={40}
              />
            </Tooltip>
          }


          <h4 className="planet-name text-large uppercase font-bold text-center">{props.planetStats.name}</h4>

          <Tooltip content="The impact of the community minus the base rate of decay over an hour" showArrow={true} placement='bottom'>
            <div className='text-center'>

              <p className='small-info'>{(decayRate > 0) ? "+" : ""}<AnimatedNumber aria-label="bugKills" value={decayRate} formatValue={formatDecay} duration={1100} />% /h</p>

            </div>
          </Tooltip>

          <div className="pt-2 flex flex-col gap-4 w-full max-w-md">
            {hasEvent &&
              <CountdownTimer className="text-gray-400 absolute w-full text-right float-right pr-6" currentTime={props.planetStats.time} endTime={endTime} />
            }



            {/* TODO Based on whether its a joint campaign (defense) or liberation, show another bar*/}
            <Progress color="warning" aria-label="Democratizing" value={liberation} radius='none'
              showValueLabel={true} formatOptions={{ style: 'percent', minimumFractionDigits: 3, maximumFractionDigits: 3 }} />
            {/* <Progress color="danger" aria-label="Democratizing" value={liberation} radius='none'
              showValueLabel={false} formatOptions={{ style: 'percent', minimumFractionDigits: 3, maximumFractionDigits: 3 }} className='-mt-6' /> */}



          </div>

        </CardBody>
        <CardFooter className='py-0'>

          {(victoryPrediction != undefined) &&
            (victoryPrediction > props.planetStats.time && victoryPrediction > 0 && props.planetStats.time > 0 && victoryPrediction < (props.planetStats.time + 864000)) ?
            <Tooltip content="Predicted victory countdown based on liberation % per hour - using realtime and historical data" placement='bottom'>
              <div className='pt-2 flex gap-4 w-full'>
                <span className='text-gray-400 inline-block float-left text-xs text-left'>Victory Countdown</span>
                <CountdownTimer className="text-gray-400 block float-right text-xs text-right" currentTime={props.planetStats.time} endTime={victoryPrediction} />
              </div>
            </Tooltip>
            :
            <div className='h-[25px] pt-2'>
              <span className='text-gray-400 inline-block float-left text-xs'>Victory Unknown</span>
            </div>
          }

        </CardFooter>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur' size='lg' ref={ref}>
        <ModalContent>

          {(onClose) => (

            <>

              <ModalHeader className="flex gap-1 justify-center modal-bg">
                <div>
                  <Image
                    alt='Faction'
                    src={props.planetStats.enemyFactionImage}
                    width={60}
                    height={60}
                    className='-mt-[0.6rem] smphone:-ml-8 phone:-ml-11 xs:-ml-20 sm:-ml-28 -ml-[9rem]'
                    style={{ position: 'absolute' }}
                  />

                  <Image
                    alt="Card background"
                    className="rounded-xl object-cover brightness-75"
                    src={props.planetStats.image}

                    width={250}
                  />

                  <Image
                    alt="Shield"
                    className='absolute -mt-[4.5rem] ml-48 drop-shadow-2xl'
                    src={(props.planetStats.hasEvent) ? "/images/shield.svg" : "/images/swords.svg"}
                    width={60}
                  />
                  {/* <Progress color="warning" aria-label="Democratizing" value={liberation} size='md' radius='none'
                    showValueLabel={true} formatOptions={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, compactDisplay: 'short' }}
                    className='pl-1 -mt-10 smphone:-ml-4 phone:-ml-14 xs:-ml-20 sm:-ml-28' style={{ position: "absolute", width: "10rem", zIndex: "10" }} /> */}

                  <div className='flex justify-center'>
                    <p className={((decayRate > 0) ? 'text-green-500' : 'text-red-500') + ' bg-[#18181a] mt-2 w-36 -mb-1 text-center font-bold text-medium rounded-lg font-[lato]'}>{(decayRate > 0) ? "+" : ""}<AnimatedNumber aria-label="decay" value={decayRate} formatValue={formatDecay} duration={1100} />% /h</p>

                  </div>
                  <div className='flex justify-center'>
                    <Tooltip content="Victory prediction countdown" placement='bottom'>
                      <div className='before:bg-white/10 border-white/20 border-1 rounded-large px-3 shadow-small text-sm mt-3 -mb-2 flex'>
                        {(victoryPrediction != undefined) &&
                          (victoryPrediction > props.planetStats.time && victoryPrediction > 0 && victoryPrediction < (props.planetStats.time + 864000)) ?
                          <>
                            <Image src='/images/victory.svg' width={27} />

                            <CountdownTimer className="pl-1 pt-[3px] flex-grow" currentTime={props.planetStats.time} endTime={victoryPrediction} />
                          </>
                          : <p>Victory Unknown</p>
                        }
                      </div>
                    </Tooltip>
                  </div>
                  <p className='smphone:text-xs sm:text-small font-[lato] absolute mt-5 sm:ml-60 smphone:ml-48'><AnimatedNumber aria-label="players" value={playerCount} formatValue={formatValue} duration={1100} /> Players</p>

                  <div className='absolute smphone:-ml-10 smphone:-mt-28 phone:-ml-12 xs:-ml-20 sm:-ml-[7rem] sm:-mt-[6.6rem] z-50'>
                    {hasEvent &&    
                      <Tooltip content="Defense expiration timer">
                        <div className='before:border-red-600/70 border-red-600/90 border-1 rounded-large px-3 shadow-small text-sm mt-3 -mb-2 flex py-1'>
                          <Image src='/images/expire.svg' width={20} />

                          <CountdownTimer className="text-sm flex-grow leading-[1.05rem] pl-1 text-red-400" currentTime={props.planetStats.time} endTime={victoryPrediction} />
                        </div>
                      </Tooltip>
                    }
                    <CircularProgress
                      aria-label="Democratizing"
                      size="lg"
                      className= {(hasEvent ? "smphone:ml-4 sm:ml-7" : 'smphone:ml-3 sm:ml-0') + ' mt-5'}
                      classNames={{
                        svg: "w-[4rem] h-[4rem] drop-shadow-md",
                        value: "text-sm font-semibold text-white",
                      }}
                      strokeWidth={2}
                      value={Number(liberation.toFixed(2))}
                      color="warning"
                      formatOptions={{ style: "unit", unit: "percent" }}
                      showValueLabel={true}
                    />
                  </div>


                </div>
                {/* <span className={((decayRate > 0) ? 'text-green-600' : 'text-red-700') + ' small-info z-10 absolute ml-80 smphone:mr-5'} style={{marginTop: "16.8rem", fontWeight: "bold"}}>{(decayRate > 0) ? "+" : ""}{decayRate}% /h</span> */}
              </ModalHeader>
              <Divider />
              <CardLineChart planetID={planetID} campaignID={id} />
              <Divider />
              <ModalBody
                className='bg-neutral-950 z-20'>
                {/* <Tabs variant="underlined" aria-label="tabs">
                  <Tab key="info" title="Info"> */}
                <div>
                  <p>
                    <b>{props.planetStats.name}</b> is currently fighting for its <b>{(hasEvent) ? "Defense" : "Liberation"}</b> against the <b>{props.planetStats.enemyFactionName}</b> forces. We are <b>{liberation.toLocaleString('en', { maximumFractionDigits: 2 })}%</b> of the way towards victory!
                    <br />
                    Join the other <b>{playerCount.toLocaleString('en', { useGrouping: true })}</b> brave Helldivers and fight for Managed Democracy!
                  </p>

                </div>
                {/* </Tab> */}
                {/* <Tab key="stats_1" title="Stats">
                    <PlanetStats campaignID={id} planetID={planetID} />
                  </Tab> */}
                {/* </Tabs> */}
              </ModalBody>
              <ModalFooter className='bg-neutral-950 z-20'>
                <Button onClick={getImage} variant='light' className='opacity-70'>
                  <Image src='/images/camera.png'

                    width={30} />
                </Button>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>

          )}

        </ModalContent>
      </Modal>

    </>
  )
}



export default PlanetContainer