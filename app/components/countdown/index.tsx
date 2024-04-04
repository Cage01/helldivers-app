"use client"
import moment from 'moment';
import React, { useEffect, useState } from 'react'

function CountdownTimer(props: { currentTime?: number, endTime?: number, expiresIn?: number, className?: string }) {
  
  let delta = 0;
  if (props.expiresIn != undefined) {
    delta = props.expiresIn
  } else if (props.currentTime != undefined && props.endTime != undefined){
    //console.log("Current Time: " + props.currentTime)
    //console.log("End Time: " + props.endTime)

    delta = props.endTime - props.currentTime
    //console.log("Delta: " + delta)
  }
  
  //const [planetStatus, setplanetStatus] = useState(false);
  const [expire, setExpire] = useState(moment().add(delta, 'seconds').toDate().getTime());
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);



  // const end_epoch = (Number(process.env.NEXT_PUBLIC_GAME_EPOCH_TIME) + props.endTime) * 1000;
  // //console.log(end_epoch)

  // console.log(props.currentTime)
  // let delta = props.endTime - props.currentTime
  // console.log()

  // const target = new Date(end_epoch);
  // const now = new Date();
  // //console.log(now.getTime())
  // const difference = target.getTime() - now.getTime();
  // //console.log(difference)

  useEffect(() => {

    const interval = setInterval(() => {
      const now = new Date();
      const difference = expire - now.getTime();
    
      //console.log(difference)

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      setDays(d);

      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      setHours(h);

      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      setMinutes(m);

      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setSeconds(s);

      // if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
      //   setPartyTime(true);
      // }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={(props.className != undefined) ? props.className : ""}>
      {(days > 0) ?
        <span className="time">{days}d</span> : <></>}

      {(hours > 0 || minutes > 0 || seconds > 0) ?
        <>
          <span className="time"> {hours}h</span>
          <span className="time"> {minutes}m</span>
          <span className="time"> {seconds}s</span>
        </>
      :
      <></>
      }

    </div>
  )
}

export default CountdownTimer