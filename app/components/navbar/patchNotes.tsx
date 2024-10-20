"use client"
import React from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Image, Divider, Chip } from "@nextui-org/react";
import { PressEvent } from '@react-types/shared';
import BBCode from '@bbob/react';
import presetReact from '@bbob/preset-react';

import { Newsitem, SteamNews } from '@/app/types/api/steam/steam_news_types';
import moment from 'moment-timezone';

interface Item {
    patchNum: string,
    date: string,
    title: string,
    contents: string,
}

function PatchNotesButton(props: { news: SteamNews }) {
    //const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const plugins = [presetReact()];

    const newsItems: Item[] = []

    //console.log(props.news.appnews)
    for (var i = 0; i < props.news.appnews.newsitems.length; i++) {
        var newsItem: Newsitem = props.news.appnews.newsitems[i];
        if (newsItem.contents.includes("previewyoutube")) {
            console.log("found skipping")
            continue;
        }

        //check tags
        let hasTag = false;
        if (newsItem.tags != undefined) {
            newsItem.tags.forEach(element => {
                if (element.includes("patchnotes")) {
                    hasTag = true;
                }
            });
        }


        
        let match: boolean = (newsItem.title.split(" ")[0].toLowerCase() == "patch")
        if (newsItem.feed_type == 1 && (hasTag || newsItem.feedname == "steam_community_announcements" && match)) {
            let content = newsItem.contents
                //.replace(/[^\p{L}\p{N}\p{P}\p{Z}{^$=+±\\'|`\\~<>}]/gu, "")
                .replace(/“|”/g, '"')
                .replace(/‘|’/g, '\'')
                .replace("[b]Fixes", "🔧 [b]Fixes")
                .replace("[b]Overview", "🌎 [b]Overview")
                .replace("[b]Known Issues", "🧠 [b]Known Issues")
                .replace("[b]Balancing", "⚖️ [b]Balancing")
                .replace("[b]Gameplay", "🎮 [b]Gameplay")
                .replace("[b]Stratagems", "👾 [b]Stratagems")
                .replace("[b]Enemies", "💀 [b]Enemies")
                .replace("[b]Tutorial", "📕 [b]Tutorial")
                .replace("[b]Helldiver", "[img]/images/helldiver_salute.webp[/img] [b]Helldiver")

            //Parse patch number if possible and grab contents
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                newsItems.push({
                    patchNum: newsItem.title.split(/(\d.*)/, 2)[1],
                    title: newsItem.title.replaceAll("🛠️", "").replaceAll("⚙️",""),
                    date: moment(new Date(newsItem.date * 1000)).tz(tz).format('MMM DD YYYY HH:mm A'),
                    contents: content
                })


            //break
        }
    }
    // /console.log(newsItems)
    for (let i = 0; i < 31; i++) {
        newsItems.pop()
    }

    console.log(newsItems[newsItems.length - 1])
    

    // onPress={onOpen}
    return (
        <>
            <Button className="z-50" color="success" variant="ghost" radius='none' onPress={onOpen}>Patch {newsItems[0].patchNum}</Button>


            <Modal
                backdrop='blur'
                isOpen={isOpen}
                onClose={onClose}
                size='3xl'
                className='h-screen'
                scrollBehavior='inside'
                classNames={{

                    body: "py-6",
                    base: "border-[#6d6d6e] text-[#eaeaea]",
                    header: "dark:bg-[#0c0c0d] border-[#6d6d6e]",
                    footer: "border-[#6d6d6e]",
                }}
            >
                <ModalContent>
                    {(onClose: ((e: PressEvent) => void) | undefined) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className='flex flex-wrap items-start justify-center'>
                                    <Image
                                        src='/images/cog.svg'
                                        width={45}
                                    />
                                    <div className='w-full text-center subtitle'>Patch Notes</div>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div>
                                    {newsItems.map((item, index) => (
                                        <>

                                            <h2 className='font-bold'>🛠️ {item.title} ⚙️<br /></h2>
                                            <p className='text-sm text-gray-500'>{item.date}</p>
                                            <div className='pt-4'>
                                                <BBCode plugins={plugins} options={{ enableEscapeTags: true }}>
                                                    {item.contents.replaceAll("\n", "[br]")}
                                                </BBCode>
                                                {(index == 0) &&
                                                    <Chip className="float-right mb-5" variant="flat" color="success">Most Recent</Chip>
                                                }
                                            </div>

                                            <Divider className='pt-3 mt-4 mb-6' />
                                        </>
                                    ))}

                                </div>

                            </ModalBody>
                            <ModalFooter>
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

export default PatchNotesButton