import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, type ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ETFHistoricalData } from '../types/etf';
import './PriceChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceChartProps {
    data: ETFHistoricalData[];
    symbol: string;
    height?: number;
}

export function PriceChart({ data, symbol, height = 300 }: PriceChartProps) {
    const chartRef = useRef<ChartJS<'line'>>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Calculate if trend is positive
    const isPositive = data.length >= 2 ? data[data.length - 1].close >= data[0].close : true;
    const chartColor = isPositive ? '#22c55e' : '#ef4444';

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        // Create gradient
        const ctx = chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `${chartColor}20`);
        gradient.addColorStop(1, `${chartColor}00`);

        if (chart.data.datasets[0]) {
            chart.data.datasets[0].backgroundColor = gradient;
            chart.update();
        }
    }, [data, chartColor, height]);

    const chartData = {
        labels: data.map(d => formatDate(d.date)),
        datasets: [
            {
                label: symbol,
                data: data.map(d => d.close),
                borderColor: chartColor,
                backgroundColor: `${chartColor}20`,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: chartColor,
                pointBorderColor: '#18181b',
                pointBorderWidth: 2,
                borderWidth: 2
            }
        ]
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderWidth: 1,
                titleColor: '#fafafa',
                bodyColor: '#a1a1aa',
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: (items) => {
                        if (items[0]) {
                            return items[0].label || '';
                        }
                        return '';
                    },
                    label: (item) => {
                        return `${symbol}: ${formatPrice(item.raw as number)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false
                },
                ticks: {
                    color: '#71717a',
                    maxTicksLimit: 6,
                    font: {
                        size: 11
                    }
                },
                border: {
                    display: false
                }
            },
            y: {
                display: true,
                position: 'right',
                grid: {
                    color: 'rgba(63, 63, 70, 0.3)'
                },
                ticks: {
                    color: '#71717a',
                    font: {
                        size: 11
                    },
                    callback: (value) => {
                        return formatPrice(value as number);
                    }
                },
                border: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        elements: {
            line: {
                capBezierPoints: true
            }
        }
    };

    if (data.length === 0) {
        return (
            <div className="chart-container empty">
                <p>Keine Daten verfügbar</p>
            </div>
        );
    }

    return (
        <div className="chart-container" style={{ height }}>
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    );
}
