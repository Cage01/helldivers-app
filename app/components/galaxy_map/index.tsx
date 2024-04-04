"use server"
import React from 'react'
import SectorChart from './sectorChart'
import PlayerCount from './playerCount'
import './galaxyMap.css'
import '@/app/stars.css'

//const fetcher = (url: string | URL | Request) => fetch(url).then(r => r.json())
async function GalaxyMap() {

    return (
        <section id='banner'>
            <div id='stars'></div>
            <div id='stars2'></div>
            <div id='stars3'></div>

            <SectorChart />

            <div id='title' className='md:-mt-2'>
                <span>Live War Efforts</span>
            </div>

            <PlayerCount />
        </section>
    )
}

export default GalaxyMap