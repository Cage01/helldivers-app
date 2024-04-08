"use client"
import { Chip } from '@nextui-org/react';
import React from 'react'

function SiteMessage(props: { SiteMessage: string, timestamp: Date }) {

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="fixed z-[50] w-full bg-[#aa2d31]/80 font-bold py-2 px-1">
          <p className="text-center text-tiny text-gray-300">{props.timestamp.toLocaleString('en-US', {timeZone: tz})}</p>
          <p className="text-center text-sm text-gray-200">{props.SiteMessage}</p>
        </div>
    )
}

export default SiteMessage