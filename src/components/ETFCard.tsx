import type { ETFQuote } from '../types/etf';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Star, Scale, TrendingUp, TrendingDown, Check } from 'lucide-react';
import './ETFCard.css';

interface ETFCardProps {
    etf: ETFQuote;
    showActions?: boolean;
    compact?: boolean;
}

export function ETFCard({ etf, showActions = true, compact = false }: ETFCardProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist, addToComparison, isInComparison } = useApp();

    const isPositive = etf.changePercent >= 0;
    const inWatchlist = isInWatchlist(etf.symbol);
    const inComparison = isInComparison(etf.symbol);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: etf.currency || 'USD'
        }).format(price);
    };

    const formatPercent = (percent: number) => {
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
        if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
        if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
        return volume.toString();
    };

    if (compact) {
        return (
            <Link to={`/etf/${etf.symbol}`} className="etf-card-compact">
                <div className="etf-card-compact-left">
                    <span className="etf-symbol">{etf.symbol}</span>
                    <span className="etf-name-compact">{etf.name}</span>
                </div>
                <div className="etf-card-compact-right">
                    <span className="etf-price">{formatPrice(etf.price)}</span>
                    <span className={`etf-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatPercent(etf.changePercent)}
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <div className="etf-card">
            <div className="etf-card-header">
                <Link to={`/etf/${etf.symbol}`} className="etf-symbol-link">
                    <span className="etf-symbol">{etf.symbol}</span>
                </Link>
                <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{formatPercent(etf.changePercent)}</span>
                </span>
            </div>

            <Link to={`/etf/${etf.symbol}`} className="etf-name">{etf.name}</Link>

            <div className="etf-price-container">
                <span className="etf-price-large">{formatPrice(etf.price)}</span>
                <span className={`etf-change-amount ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '+' : ''}{formatPrice(etf.change)}
                </span>
            </div>

            <div className="etf-stats">
                <div className="etf-stat">
                    <span className="etf-stat-label">Volumen</span>
                    <span className="etf-stat-value">{formatVolume(etf.volume)}</span>
                </div>
                <div className="etf-stat">
                    <span className="etf-stat-label">Eröffnung</span>
                    <span className="etf-stat-value">{formatPrice(etf.open)}</span>
                </div>
                <div className="etf-stat">
                    <span className="etf-stat-label">52W Hoch</span>
                    <span className="etf-stat-value">{formatPrice(etf.fiftyTwoWeekHigh)}</span>
                </div>
                <div className="etf-stat">
                    <span className="etf-stat-label">52W Tief</span>
                    <span className="etf-stat-value">{formatPrice(etf.fiftyTwoWeekLow)}</span>
                </div>
            </div>

            {showActions && (
                <div className="etf-card-actions">
                    <button
                        className={`btn btn-sm ${inWatchlist ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => inWatchlist ? removeFromWatchlist(etf.symbol) : addToWatchlist(etf)}
                    >
                        <Star size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
                        {inWatchlist ? 'Watchlist' : 'Watchlist'}
                    </button>
                    <button
                        className={`btn btn-sm ${inComparison ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => addToComparison(etf.symbol)}
                        disabled={inComparison}
                    >
                        {inComparison ? <Check size={14} /> : <Scale size={14} />}
                        {inComparison ? 'Verglichen' : 'Vergleichen'}
                    </button>
                </div>
            )}

            <div className="etf-card-sparkline">
                <div className={`sparkline ${isPositive ? 'positive' : 'negative'}`}></div>
            </div>
        </div>
    );
}
