
"use client"
import React, { useEffect, useState } from "react";
import { Chrono } from "react-chrono";
import '@/app/globals.css'
import './timeline.scss'
import { Card, CardBody, CardHeader, Divider, Image, Spinner } from "@nextui-org/react";
import useEmblaCarousel from 'embla-carousel-react'
import { fetcher } from "@/app/classes/fetch";
import useSWR from "swr";
import { FGlobalEvent } from "@/app/types/firebase_types";
import { NewsFeed } from "@/app/types/api/helldivers/news_feed_types";

function TimelineComponent(props: { newsFeed: NewsFeed[] }) {


    const [globalEvents, setGlobalEvents] = useState<NewsFeed[]>();
    const { data } = useSWR("/api/timeline", fetcher);
    //console.log(data)

    //console.log(globalEvents)

    useEffect(() => {
        if (data != undefined) {
            //console.log(data)
            setGlobalEvents(data as NewsFeed[])

        }
    }, [data]);

    let items: { date: Date }[] = [];
    if (globalEvents != undefined) {
        globalEvents.forEach(element => {
            //console.log(element.created)
            //items.push({ date: new Date(element.created.seconds * 1000) })
        });
    }
    // const items = [
    //     {
    //         date: new Date("2022-03-25T10:00:00Z")
    //     },
    //     {
    //         date: new Date("2022-03-28T14:00:00Z"),
    //         cardTitle: "Card Title 2",
    //         cardSubTitle: "Card Subtitle 2",
    //     },
    // ];

    const [isClient, setIsClient] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
    useEffect(() => {
        setIsClient(true); // Component has mounted, update state to trigger re-render   
    }, []);

    let filledArray = new Array(20).fill(0);

    return (
        <div>
            {(isClient && globalEvents != undefined && globalEvents.length > 0) ?
                <Chrono
                    items={items}
                    mode="HORIZONTAL"
                    //cardLess={true}
                    disableToolbar={true}
                    timelinePointShape="diamond"
                    timelinePointDimension={15}
                    cardHeight={400}
                    // slideshow={true}
                    // slideItemDuration={500}
                    // slideShowType="reveal"
                    theme={{
                        cardTitleColor: "#FFF",

                        cardDetailsColor: "#FFF",
                        cardDetailsBackGround: "#0c0c0d",
                        cardSubtitleColor: "#FFF",
                        cardMediaBgColor: "#0c0c0d",
                        titleColor: "#6d6d6e",
                        titleColorActive: "#eaeaea",
                        primary: "#6d6d6e",
                        secondary: "#18181a",
                        cardBgColor: "#050505"
                    }}
                >
                    {globalEvents.map((event) => (
                        <Card key={crypto.randomUUID()} className="smphone:w-screen sm:max-w-[60%] h-96">
                            <div className="pt-2 w-[100%] flex-row flex-wrap justify-center items-center flex">
                                <Image
                                    className=''
                                    style={{ margin: "auto", display: "block", opacity: "0.7" }}
                                    src='/images/helldivers_skull.svg'
                                    width={50} />
                            </div>
                            <div className="w-[100%]">
                                <h2 className="text-center text-xl pb-4">Battle Report</h2>

                            </div>


                            <CardHeader style={{ backgroundColor: "#0c0c0d", borderRadius: 0 }}>
                                {(filledArray.length > 0) ?
                                    <div className="embla" ref={emblaRef}>
                                        <div className="embla__container">
                                            {filledArray.map((arrayItem) => (
                                                <Card key={crypto.randomUUID()} className="embla__slide select-none">
                                                    <CardHeader className="pb-0 pt-2 px-4 flex-col">
                                                        <Image key={crypto.randomUUID()}
                                                            src="/images/planets/Notoqum II 29d6fc32.png"
                                                            width={50}
                                                        />
                                                    </CardHeader>
                                                    <CardBody>
                                                        <span className="text-center text-sm break-words">Mavlevalon Creek</span>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                    :
                                    <div className="smphone:h-16 md:h-10 w-[100%]">
                                        <h4 className="text-center pt-2 text-neutral-600">No records of this time.</h4>
                                    </div>
                                }
                            </CardHeader>
                            <Divider />
                            <CardBody>fames ac turpis egestas integer eget aliquet nibh praesent tristique magna sit amet purus gravida quis blandit turpis cursus in hac habitasse platea dictumst quisque sagittis purus sit amet volutpat consequat mauris nunc congue nisi vitae suscipit tellus mauris a diam maecenas sed enim ut sem viverra aliquet eget sit</CardBody>
                        </Card>
                    ))}

                </Chrono>

                : <Spinner color="default" />}
        </div>
    )
}

export default TimelineComponent