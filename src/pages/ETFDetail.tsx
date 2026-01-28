import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getETFQuote, getETFHistoricalData, calculatePerformance } from '../services/api';
import { PriceChart } from '../components/PriceChart';
import { useApp } from '../context/AppContext';
import type { ETFQuote, ETFHistoricalData, TimeRange } from '../types/etf';
import {
    ArrowLeft,
    Star,
    Scale,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
    PiggyBank,
    Check
} from 'lucide-react';
import './ETFDetail.css';

export function ETFDetail() {
    const { symbol } = useParams<{ symbol: string }>();
    const [etf, setEtf] = useState<ETFQuote | null>(null);
    const [historicalData, setHistoricalData] = useState<ETFHistoricalData[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
    const [loading, setLoading] = useState(true);
    const [performance, setPerformance] = useState({
        change1d: 0, change1w: 0, change1m: 0, change3m: 0, change6m: 0, change1y: 0, volatility: 0
    });

    const { addToWatchlist, removeFromWatchlist, isInWatchlist, addToComparison, isInComparison } = useApp();

    useEffect(() => {
        async function loadETF() {
            if (!symbol) return;

            setLoading(true);
            try {
                const quote = await getETFQuote(symbol);
                const history = await getETFHistoricalData(symbol, timeRange);
                const perf = calculatePerformance(history);

                setEtf(quote);
                setHistoricalData(history);
                setPerformance(perf);
            } catch (error) {
                console.error('Failed to load ETF:', error);
            } finally {
                setLoading(false);
            }
        }

        loadETF();
    }, [symbol, timeRange]);

    const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', '5Y'];

    const formatPrice = (price: number, currency = 'USD') => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency
        }).format(price);
    };

    const formatPercent = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
        if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
        if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
        return volume.toString();
    };

    if (loading) {
        return (
            <div className="etf-detail-page">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Lade ETF-Daten...</p>
                </div>
            </div>
        );
    }

    if (!etf) {
        return (
            <div className="etf-detail-page">
                <div className="detail-error">
                    <TrendingDown size={64} strokeWidth={1} />
                    <h2>ETF nicht gefunden</h2>
                    <p>Der ETF mit Symbol "{symbol}" konnte nicht gefunden werden.</p>
                    <Link to="/search" className="btn btn-primary">
                        Zurück zur Suche
                    </Link>
                </div>
            </div>
        );
    }

    const inWatchlist = isInWatchlist(etf.symbol);
    const inComparison = isInComparison(etf.symbol);
    const isPositive = etf.changePercent >= 0;

    return (
        <div className="etf-detail-page">
            {/* Back Link */}
            <Link to="/search" className="back-link">
                <ArrowLeft size={16} />
                Zurück zur Suche
            </Link>

            {/* Header */}
            <div className="detail-header">
                <div className="header-left">
                    <div className="header-main">
                        <h1 className="etf-symbol-large">{etf.symbol}</h1>
                        <span className={`price-badge ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {formatPercent(etf.changePercent)}
                        </span>
                    </div>
                    <h2 className="etf-name-large">{etf.name}</h2>
                    <div className="etf-meta">
                        <span className="meta-item">{etf.exchange}</span>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">{etf.currency}</span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="current-price">
                        <span className="price-label">Aktueller Kurs</span>
                        <span className="price-value">{formatPrice(etf.price, etf.currency)}</span>
                        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? '+' : ''}{formatPrice(etf.change, etf.currency)} ({formatPercent(etf.changePercent)})
                        </span>
                    </div>

                    <div className="header-actions">
                        <button
                            className={`btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => inWatchlist ? removeFromWatchlist(etf.symbol) : addToWatchlist(etf)}
                        >
                            <Star size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
                            {inWatchlist ? 'Auf Watchlist' : 'Zur Watchlist'}
                        </button>
                        <button
                            className={`btn ${inComparison ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => addToComparison(etf.symbol)}
                            disabled={inComparison}
                        >
                            {inComparison ? <Check size={16} /> : <Scale size={16} />}
                            {inComparison ? 'Im Vergleich' : 'Vergleichen'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <section className="chart-section">
                <div className="chart-header">
                    <h3>Kursentwicklung</h3>
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
                <PriceChart data={historicalData} symbol={etf.symbol} height={400} />
            </section>

            {/* Stats Grid */}
            <section className="stats-section">
                <h3 className="section-title">
                    <BarChart3 size={24} />
                    Kennzahlen
                </h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Eröffnung</span>
                        <span className="stat-value">{formatPrice(etf.open, etf.currency)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Vortag</span>
                        <span className="stat-value">{formatPrice(etf.previousClose, etf.currency)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Tageshoch</span>
                        <span className="stat-value">{formatPrice(etf.high, etf.currency)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Tagestief</span>
                        <span className="stat-value">{formatPrice(etf.low, etf.currency)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">52W Hoch</span>
                        <span className="stat-value">{formatPrice(etf.fiftyTwoWeekHigh, etf.currency)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">52W Tief</span>
                        <span className="stat-value">{formatPrice(etf.fiftyTwoWeekLow, etf.currency)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Volumen</span>
                        <span className="stat-value">{formatVolume(etf.volume)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Ø Volumen</span>
                        <span className="stat-value">{formatVolume(etf.avgVolume)}</span>
                    </div>
                </div>
            </section>

            {/* Performance Section */}
            <section className="performance-section">
                <h3 className="section-title">
                    <Activity size={24} />
                    Performance
                </h3>
                <div className="performance-grid">
                    <div className="performance-card">
                        <span className="perf-label">7 Tage</span>
                        <span className={`perf-value ${performance.change1w >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(performance.change1w)}
                        </span>
                    </div>
                    <div className="performance-card">
                        <span className="perf-label">1 Monat</span>
                        <span className={`perf-value ${performance.change1m >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(performance.change1m)}
                        </span>
                    </div>
                    <div className="performance-card">
                        <span className="perf-label">3 Monate</span>
                        <span className={`perf-value ${performance.change3m >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(performance.change3m)}
                        </span>
                    </div>
                    <div className="performance-card">
                        <span className="perf-label">6 Monate</span>
                        <span className={`perf-value ${performance.change6m >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(performance.change6m)}
                        </span>
                    </div>
                    <div className="performance-card">
                        <span className="perf-label">1 Jahr</span>
                        <span className={`perf-value ${performance.change1y >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(performance.change1y)}
                        </span>
                    </div>
                    <div className="performance-card">
                        <span className="perf-label">Volatilität</span>
                        <span className="perf-value">{performance.volatility.toFixed(1)}%</span>
                    </div>
                </div>
            </section>

            {/* Actions */}
            <section className="actions-section">
                <Link to="/compare" className="action-card">
                    <div className="action-icon">
                        <Scale size={28} />
                    </div>
                    <div className="action-content">
                        <h4>Zum Vergleich hinzufügen</h4>
                        <p>Vergleiche diesen ETF mit anderen</p>
                    </div>
                    <ArrowLeft size={20} className="action-arrow" style={{ transform: 'rotate(180deg)' }} />
                </Link>

                <Link to="/savings" className="action-card">
                    <div className="action-icon">
                        <PiggyBank size={28} />
                    </div>
                    <div className="action-content">
                        <h4>Sparplan erstellen</h4>
                        <p>Erstelle einen Sparplan mit diesem ETF</p>
                    </div>
                    <ArrowLeft size={20} className="action-arrow" style={{ transform: 'rotate(180deg)' }} />
                </Link>
            </section>
        </div>
    );
}
