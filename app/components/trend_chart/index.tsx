import React, { useEffect, useState } from 'react';
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
import faker from 'faker';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';

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
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
    stacked: false,
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: false,
            text: 'Chart.js Line Chart - Multi Axis',
        },
        tooltip: {
            enabled: false
        }
    },
    scales: {
        x: {
            display: false
        },
        y: {
            type: 'linear' as const,
            display: false,
            position: 'left' as const,
        },
        y1: {
            type: 'linear' as const,
            display: false,
            position: 'right' as const,
            grid: {
                drawOnChartArea: false,
            },
        },
    },
};


export function TrendChart(props: { dataArray?: any[] }) {
    const [dataset, setDataset] = useState<chartset>();

    useEffect(() => {
        if (props.dataArray != undefined) {
            let labels: string[] = [];
            let statData: number[] = [];

            props.dataArray.forEach(element => {
                let date = moment(new Date(element.created.time * 1000)).format("M/D/YY hh:mm A")
                labels.push(date)
                statData.push(element.value)
            });

            const tmp = {
                labels,
                datasets: [
                    {
                        label: 'stat',
                        data: statData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        pointRadius: 0,
                        borderWidth: 0.8,
                        yAxisID: 'y',
                    },
                ]
            }

            setDataset(tmp)
        }

    }, [props.dataArray])

    if (dataset != undefined) {
        return (
            <div className='h-[2.4rem]'>
                <Line options={options} data={dataset} />
            </div>

        )
    } else {
        return (
            <Skeleton>
                <div className='h-[2.4rem]'></div>
            </Skeleton>
        )
    }
}
