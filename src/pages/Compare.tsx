import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getETFQuote, getETFHistoricalData, calculatePerformance } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import type { ETFQuote, ETFHistoricalData, TimeRange } from '../types/etf';
import { Scale, Trash2, X, Trophy, TrendingDown, DollarSign, Search } from 'lucide-react';
import './Compare.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ComparisonETF extends ETFQuote {
    historicalData: ETFHistoricalData[];
    performance: {
        change1d: number;
        change1w: number;
        change1m: number;
        change3m: number;
        change6m: number;
        change1y: number;
        volatility: number;
    };
}

const CHART_COLORS = [
    '#f97316', // Orange
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#8b5cf6'  // Purple
];

export function Compare() {
    const { comparisonList, removeFromComparison, clearComparison } = useApp();
    const [etfs, setEtfs] = useState<ComparisonETF[]>([]);
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

    useEffect(() => {
        async function loadComparison() {
            if (comparisonList.length === 0) {
                setEtfs([]);
                return;
            }

            setLoading(true);
            try {
                const loadedEtfs = await Promise.all(
                    comparisonList.map(async (symbol) => {
                        const quote = await getETFQuote(symbol);
                        const historicalData = await getETFHistoricalData(symbol, timeRange);
                        const performance = calculatePerformance(historicalData);

                        return quote ? {
                            ...quote,
                            historicalData,
                            performance
                        } : null;
                    })
                );

                setEtfs(loadedEtfs.filter((etf): etf is ComparisonETF => etf !== null));
            } catch (error) {
                console.error('Failed to load comparison:', error);
            } finally {
                setLoading(false);
            }
        }

        loadComparison();
    }, [comparisonList, timeRange]);

    const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', '5Y'];

    const formatPercent = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const formatPrice = (price: number, currency = 'USD') => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency
        }).format(price);
    };

    const getColorClass = (value: number) => {
        return value >= 0 ? 'positive' : 'negative';
    };

    if (comparisonList.length === 0) {
        return (
            <div className="compare-page">
                <div className="compare-empty">
                    <Scale size={80} strokeWidth={1} />
                    <h2>Keine ETFs zum Vergleichen</h2>
                    <p>Füge ETFs zu deinem Vergleich hinzu, um sie nebeneinander zu analysieren.</p>
                    <a href="/search" className="btn btn-primary btn-lg">
                        <Search size={18} />
                        ETFs suchen
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-page">
            <div className="compare-header">
                <div className="compare-header-left">
                    <h1 className="compare-title">
                        <Scale size={32} />
                        ETF Vergleich
                    </h1>
                    <p className="compare-subtitle">
                        Vergleiche {comparisonList.length} ETF{comparisonList.length > 1 ? 's' : ''} nebeneinander
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={clearComparison}>
                    <Trash2 size={16} />
                    Alle entfernen
                </button>
            </div>

            {/* ETF Pills */}
            <div className="compare-pills">
                {etfs.map((etf, index) => (
                    <div
                        key={etf.symbol}
                        className="compare-pill"
                        style={{ '--pill-color': CHART_COLORS[index] } as React.CSSProperties}
                    >
                        <div
                            className="pill-color"
                            style={{ backgroundColor: CHART_COLORS[index] }}
                        ></div>
                        <span className="pill-symbol">{etf.symbol}</span>
                        <span className="pill-price">{formatPrice(etf.price, etf.currency)}</span>
                        <span className={`pill-change ${getColorClass(etf.changePercent)}`}>
                            {formatPercent(etf.changePercent)}
                        </span>
                        <button
                            className="pill-remove"
                            onClick={() => removeFromComparison(etf.symbol)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="compare-chart-section">
                <div className="chart-header">
                    <h2 className="chart-title">Kursentwicklung</h2>
                    <div className="time-range-selector">
                        {timeRanges.map(range => (
                            <button
                                key={range}
                                className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>


                {loading ? (
                    <div className="chart-loading">
                        <div className="chart-loading-spinner"></div>
                    </div>
                ) : (
                    <div className="comparison-chart">
                        {etfs.length > 0 && (
                            <div style={{ height: 400 }}>
                                <Line
                                    data={{
                                        labels: etfs[0].historicalData.map(d => {
                                            const date = new Date(d.date);
                                            return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
                                        }),
                                        datasets: etfs.map((etf, index) => ({
                                            label: etf.symbol,
                                            data: etf.historicalData.map(d => d.close),
                                            borderColor: CHART_COLORS[index],
                                            backgroundColor: 'transparent',
                                            tension: 0.4,
                                            pointRadius: 0,
                                            pointHoverRadius: 6,
                                            borderWidth: 2
                                        }))
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: '#18181b',
                                                borderColor: '#27272a',
                                                borderWidth: 1,
                                                titleColor: '#fafafa',
                                                bodyColor: '#a1a1aa',
                                                padding: 12,
                                                mode: 'index',
                                                intersect: false
                                            }
                                        },
                                        scales: {
                                            x: {
                                                display: true,
                                                grid: { display: false },
                                                ticks: { color: '#71717a', maxTicksLimit: 8 }
                                            },
                                            y: {
                                                display: true,
                                                position: 'right',
                                                grid: { color: 'rgba(63, 63, 70, 0.3)' },
                                                ticks: { color: '#71717a' }
                                            }
                                        },
                                        interaction: {
                                            mode: 'index',
                                            intersect: false
                                        }
                                    }}
                                />
                            </div>
                        )}
                        <div className="chart-legend">
                            {etfs.map((etf, index) => (
                                <div key={etf.symbol} className="chart-legend-item">
                                    <div
                                        className="legend-color"
                                        style={{ backgroundColor: CHART_COLORS[index] }}
                                    ></div>
                                    <span className="legend-symbol">{etf.symbol}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Comparison Table */}
            <div className="compare-table-section">
                <h2 className="section-title">Detaillierter Vergleich</h2>
                <div className="table-container">
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th>Metrik</th>
                                {etfs.map((etf, index) => (
                                    <th key={etf.symbol}>
                                        <div className="th-content">
                                            <div
                                                className="th-color"
                                                style={{ backgroundColor: CHART_COLORS[index] }}
                                            ></div>
                                            <span>{etf.symbol}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="metric-name">Aktueller Kurs</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className="metric-value">
                                        {formatPrice(etf.price, etf.currency)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">Tagesänderung</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className={`metric-value ${getColorClass(etf.changePercent)}`}>
                                        {formatPercent(etf.changePercent)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">7 Tage</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className={`metric-value ${getColorClass(etf.performance.change1w)}`}>
                                        {formatPercent(etf.performance.change1w)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">1 Monat</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className={`metric-value ${getColorClass(etf.performance.change1m)}`}>
                                        {formatPercent(etf.performance.change1m)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">3 Monate</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className={`metric-value ${getColorClass(etf.performance.change3m)}`}>
                                        {formatPercent(etf.performance.change3m)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">6 Monate</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className={`metric-value ${getColorClass(etf.performance.change6m)}`}>
                                        {formatPercent(etf.performance.change6m)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">1 Jahr</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className={`metric-value ${getColorClass(etf.performance.change1y)}`}>
                                        {formatPercent(etf.performance.change1y)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">Volatilität (ann.)</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className="metric-value">
                                        {etf.performance.volatility.toFixed(1)}%
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">52W Hoch</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className="metric-value">
                                        {formatPrice(etf.fiftyTwoWeekHigh, etf.currency)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="metric-name">52W Tief</td>
                                {etfs.map(etf => (
                                    <td key={etf.symbol} className="metric-value">
                                        {formatPrice(etf.fiftyTwoWeekLow, etf.currency)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="compare-insights">
                <h2 className="section-title">Quick Insights</h2>
                <div className="insights-grid">
                    {etfs.length >= 2 && (
                        <>
                            <div className="insight-card">
                                <div className="insight-icon">
                                    <Trophy size={24} />
                                </div>
                                <div className="insight-content">
                                    <span className="insight-label">Beste Performance (1Y)</span>
                                    <span className="insight-value">
                                        {etfs.reduce((best, etf) =>
                                            etf.performance.change1y > best.performance.change1y ? etf : best
                                        ).symbol}
                                    </span>
                                </div>
                            </div>
                            <div className="insight-card">
                                <div className="insight-icon">
                                    <TrendingDown size={24} />
                                </div>
                                <div className="insight-content">
                                    <span className="insight-label">Niedrigste Volatilität</span>
                                    <span className="insight-value">
                                        {etfs.reduce((lowest, etf) =>
                                            etf.performance.volatility < lowest.performance.volatility ? etf : lowest
                                        ).symbol}
                                    </span>
                                </div>
                            </div>
                            <div className="insight-card">
                                <div className="insight-icon">
                                    <DollarSign size={24} />
                                </div>
                                <div className="insight-content">
                                    <span className="insight-label">Höchster Preis</span>
                                    <span className="insight-value">
                                        {etfs.reduce((highest, etf) =>
                                            etf.price > highest.price ? etf : highest
                                        ).symbol}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
