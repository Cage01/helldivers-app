
import React from 'react'
import './timeline.scss'
import '@/app/globals.css'
import '@/app/stars.css'
import TimelineComponent from './components/timeline';
import { Image } from '@nextui-org/react'
import { queryNewsFeedExternal } from '../utilities/server_functions';
import { NewsFeed } from '../types/api/helldivers/news_feed_types';

async function Timeline() {

    let newsFeed: NewsFeed[] = await queryNewsFeedExternal();
    //console.log(newsFeed)

    return (
        <>
            <section>
                <div id='stars'></div>
                <div id='stars2'></div>
                <div id='stars3'></div>

                <div className='w-screen h-auto text-center relative'>

                </div>
                <div id='title' className='smphone:-mt-20 md:mt-0 text-center'><span>The Hall of Victories and Charitable Concessions</span></div>
            </section>

            <div className='pt-10'>
                <TimelineComponent newsFeed={newsFeed}/>
            </div>
            {/* <div className='pt-10 float-right w-[50%]'>
                Test
            </div> */}
        </>
    )
}

export default Timeline