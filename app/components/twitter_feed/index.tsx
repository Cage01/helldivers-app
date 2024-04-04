'use client'
import React from 'react'
import { TwitterTimelineEmbed } from 'react-twitter-embed'

function TwitterFeed() {
    return (
        <>
            <TwitterTimelineEmbed
                sourceType="profile"
                screenName="Pilestedt"
                options={{ height: 400 }}
                
                
            />
        </>
    )
}

export default TwitterFeed