"use client"
import { fetcher } from '@/app/classes/fetch';
import { StatusAPI } from '@/app/types/app_types';
import React, { useEffect, useState } from 'react'
import AnimatedNumber from "animated-number-react";

import useSWR from 'swr';
import { getTotalCount } from '@/app/utilities/universal_functions';


function PlayerCount() {

    
    const apiStatus: StatusAPI = (useSWR("/api/status", fetcher, { refreshInterval: 20000 })).data;
    const [playerCount, setPlayerCount] = useState(0);


    useEffect(() => {
        if (apiStatus != undefined) {
            setPlayerCount(getTotalCount(apiStatus.status.planetStatus));

        }
    }, [apiStatus]);

    const formatValue = (value: number) => {
        return value.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: true }) + " Helldivers Active"
    };

    return (
        <div id="players" className='md:-mt-4 z-50'>
            <span>
                <AnimatedNumber
                    value={playerCount}
                    formatValue={formatValue}
                    duration={1100}
                />
            </span>
            {/* <span>{playerCount.toLocaleString('en', { useGrouping: true })} Helldivers Active</span> */}

        </div>
    )
}



export default PlayerCount