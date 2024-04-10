"use server"
import React from 'react'
import { Avatar } from '@nextui-org/react';
import { Assignment, Reward } from '@/app/types/api/helldivers/assignment_types';
import { queryAssignmentExternal, queryNewsFeedExternal } from '@/app/utilities/server_functions';
import AlertCarousel from './carousel';
import { NewsFeed } from '@/app/types/api/helldivers/news_feed_types';
import { AlertItem } from '@/app/types/app_types';
import './alerts.css';


//TODO: This should probably run on the server
async function Alert() {

    const assignment: Assignment = await queryAssignmentExternal();
    const feed: NewsFeed[] = await queryNewsFeedExternal();
    const alertItems: AlertItem[] = [];


    if (assignment != undefined && assignment.setting != undefined && assignment.setting.overrideTitle != undefined && assignment.setting.overrideBrief != undefined) {
        let title: string = assignment.setting.overrideTitle.replace(/<\/?[^>]+(>|$)/g, "");
        let message: string = assignment.setting.overrideBrief.replace(/<\/?[^>]+(>|$)/g, "");

        alertItems.push({
            title: title,
            message: message,
            task: assignment.setting.taskDescription,
            //reward: assignment.setting.reward
        } as AlertItem)

    } else {
        alertItems.push({
            title: "Awaiting Orders",
            message: "We are currently awaiting orders from High Command. Stay tuned."
        } as AlertItem)
    }

    for (let i = feed.length - 1; i >= 0; i--) {
        const element = feed[i]
        if (element.message != undefined) {
            let title: string = element.message.split("\n")[0].replace(/<\/?[^>]+(>|$)/g, "");
            let message: string = element.message.split(title)[1].replace(/<\/?[^>]+(>|$)/g, "");

            if (message != undefined) {
                if (message.startsWith("\n")) {
                    message = message.substring(1)
                }

                if (!isEmpty(title) && !isEmpty(message)) {
                    let containsElement = false;
                    alertItems.forEach(element => {
                        if (element.message == message || title.toLocaleLowerCase().includes("new major order")) {
                            containsElement = true;
                        }
                    });

                    if (!containsElement) {
                        alertItems.push({
                            title: title,
                            message: message
                        } as AlertItem)
                    }
                }
            }
        }
    }

    // setNews(tmp)

    //}, [orders.data, feed.data])



    return (

        <div className="breaking-news-alert">

            <div className="breaking-news-inner">
                {/* <div className="icon"></div> */}


                <div className='icon'>
                    <Avatar isBordered src="/images/Super_earth.webp" />
                </div>
                <div className='alertWrapper smphone:max-w-[200px] sm:max-w-full'>

                    <AlertCarousel alertItems={alertItems} />

                </div>


            </div>
        </div>
    )
}


function getRewardText(reward: Reward) {
    let result = reward.amount.toString();
    if (reward.type == 1)
        result += " Medals"

    return result;
}

function isEmpty(input: string) {
    switch (typeof input) {
        case 'undefined': return true
        case 'string':
        case 'object':
            return Object.keys(input).length == 0
        case 'boolean':
        case 'bigint':
        case 'number': return input == 0
    }
}

export default Alert