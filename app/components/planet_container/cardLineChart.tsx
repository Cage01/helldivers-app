
import React, { useEffect, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { fetcher } from '@/app/classes/fetch';
import useSWR from 'swr';
import { Skeleton } from '@nextui-org/react';
import { HistoricalAPI } from '@/app/types/app_types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface chartset {
    labels: string[]; datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; }[];
}

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Liberation Activity',
        },
    },
    scales: {
        x: {
            display: false
        },
        liberation: {
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
                callback: function(tickValue: string | number) {
                    return tickValue + "%"
                }
            }
            
        },
        players: {
            suggestedMin: 5000
        }
    }
};


function CardLineChart(props: { campaignID: number, planetID: number }) {
    //console.log(data.datasets[0].data)

    //build dataset
    const data: HistoricalAPI[] = useSWR("/api/historical?planetID=" + props.planetID + "&campaignID=" + props.campaignID + "&hours=48", fetcher, { refreshInterval: 60000 }).data;
    const [dataset, setDataset] = useState<chartset>()

    useEffect(() => {
        if (data != undefined) {
            let labels: string[] = []; //labels
            let playerData: number[] = []; //playerData
            let liberationData: number[] = []; //liberationData

            data[0].progress.forEach((element: { created: number; playerCount: number; health: number; maxHealth: number; }) => {
                let date = moment(new Date(element.created * 1000)).format("M/D/YY hh:mm A")
                labels.push(date)
                playerData.push(element.playerCount)
                liberationData.push(getLiberationPercentage(element.health, element.maxHealth))
            });

            const tmp = {
                labels,
                datasets: [
                    {
                        yAxisID: 'players',
                        label: 'Players',
                        data: playerData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        pointRadius: 1,
                        hitRadius: 20,
                        intersect: false
                    },
                    {
                        yAxisID: 'liberation',
                        label: 'Liberation %',
                        data: liberationData,
                        borderColor: 'rgb(53, 162, 235)',
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        pointRadius: 1,
                        hitRadius: 20,
                        intersect: false
                    },
                ]
            }

            setDataset(tmp)
        }

    }, [data])

    if (dataset != undefined) {
        return (
            <Line options={options} data={dataset} />
        )
    } else {
        return (
            <Skeleton>
                <div className='w-96 h-64'></div>
            </Skeleton>
        )
    }




}

function getLiberationPercentage(health: number, maxHealth: number): number {
    var progress = (health / maxHealth) * 100;
    progress = 100 - progress;

    return progress;
}

export default CardLineChart