import React, { FC, useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { graphic } from 'echarts';

type Props = {
    data: any;
    loadNext:() => void;
};

const DataNavigator: FC<Props> = ({ data, loadNext }) => {
    const [chartOptions, setChartOptions] = useState<any>({});
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (data) {
            const rows = data.map((row: any) => ({
                time: row.time,
                temperature: row.temp,
            }));

            console.log("rows", rows)
            const times = rows.map(row => row.time);
            const temperatures = rows.map(row => row.temperature);

            console.log(times)
            setChartOptions({
                tooltip: {
                    trigger: 'axis',
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'center',
                    text: 'Temperature vs. Time'
                },
                toolbox: {
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: times
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                dataZoom: [
                    {
                        type: 'inside',
                        start: 0,
                        end: 10
                    },
                    {
                        start: 0,
                        end: 10
                    }
                ],
                series: [
                    {
                        name: 'Temperature',
                        type: 'line',
                        symbol: 'none',
                        sampling: 'lttb',
                        itemStyle: {
                            color: 'rgb(255, 70, 131)'
                        },
                        areaStyle: {
                            color: new graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgb(255, 158, 68)' },
                                { offset: 1, color: 'rgb(255, 70, 131)' }
                            ])
                        },
                        data: temperatures
                    }
                ]
            });
        }
    }, [data]);

    useEffect(() => {
        const chart = chartRef.current?.getEchartsInstance();
        if (chart) {
            chart.on('dataZoom', (event: any) => {
                const start = event.start;
                const end = event.end;
                console.log('DataZoom event:',start, end, event);
                if(end==100){
                    console.log('load next 50');
                    loadNext()

                }
            });

            return () => {
                chart.off('dataZoom');
            };
        }
    }, [chartOptions]);

    return (
        <React.Fragment>
            <div style={{ width: '100%', height: '500px' }}>
                {/*<ReactECharts*/}
                {/*    ref={chartRef}*/}
                {/*    option={chartOptions}*/}
                {/*    notMerge={true}*/}
                {/*    lazyUpdate={true}*/}
                {/*    theme="theme_name"*/}
                {/*    onChartReady={() => console.log("Chart is ready")}*/}
                {/*/>*/}
            </div>
        </React.Fragment>
    );
}

export default DataNavigator;
