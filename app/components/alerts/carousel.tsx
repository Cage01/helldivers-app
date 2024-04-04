"use client"
import { EmblaCarouselType } from 'embla-carousel'
import Autoplay, { AutoplayType } from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback } from 'react'
import { DotButton, useDotButton } from './dotButton'
import { AlertItem } from '@/app/types/app_types'

//TODO: make universal

function AlertCarousel(props: { alertItems: AlertItem[] }) {



    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 15000 })])

    const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
        const autoplay = emblaApi?.plugins()?.autoplay as AutoplayType
        if (!autoplay) return

        const resetOrStop =
            autoplay.options.stopOnInteraction === false
                ? autoplay.reset
                : autoplay.stop

        resetOrStop()
    }, [])

    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
        emblaApi,
        onNavButtonClick
    )
    // const { selectedIndex, scrollSnaps, onDotButtonClick } =
    // useDotButton(emblaApi)
    return (

        <div className="embla" ref={emblaRef}>
            <div className="embla__container">

                {props.alertItems.map((item, index) =>

                    <div key={index} className='embla__slide smphone:overflow-x-visible'>
                        <div className='font-bold select-none'>{item.title}</div>
                        <div className='text-sm font select-none'>{item.message}</div>
                        {(item.task != undefined) && <div className='text-sm font-bold pt-3 select-none'>{item.task}</div>}
                    </div>
                )}

            </div>

            <div className="embla__controls">
                <div className="embla__dots">
                    {scrollSnaps.map((_, index) => (
                        <DotButton
                            key={index}
                            onClick={() => onDotButtonClick(index)}
                            className={'embla__dot'.concat(
                                index === selectedIndex ? ' embla__dot--selected' : ''
                            )}
                        />
                    ))}
                </div>
            </div>

        </div>


    )
}

export default AlertCarousel