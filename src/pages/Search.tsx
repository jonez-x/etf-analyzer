import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchETFs, getTrendingETFs } from '../services/api';
import { ETFCard } from '../components/ETFCard';
import { useApp } from '../context/AppContext';
import type { ETFQuote, ETFSearchResult } from '../types/etf';
import {
    Search as SearchIcon,
    X,
    Star,
    Flame,
    Folder,
    Globe,
    Landmark,
    TrendingUp,
    Cpu,
    FileText,
    Coins
} from 'lucide-react';
import './Search.css';

export function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ETFSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [trendingETFs, setTrendingETFs] = useState<ETFQuote[]>([]);
    const { watchlist } = useApp();

    // Load trending on mount
    useEffect(() => {
        async function loadTrending() {
            const trending = await getTrendingETFs();
            setTrendingETFs(trending);
        }
        loadTrending();
    }, []);

    // Debounced search
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 1) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const searchResults = await searchETFs(searchQuery);
            setResults(searchResults);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            handleSearch(query);
        }, 300);

        return () => clearTimeout(debounce);
    }, [query, handleSearch]);

    // Convert search results to ETFQuote for display
    const getETFFromResult = (result: ETFSearchResult): ETFQuote | undefined => {
        return trendingETFs.find(etf => etf.symbol === result.symbol);
    };

    const categories = [
        { name: 'US Markt', desc: 'S&P 500, NASDAQ, Dow Jones', icon: Landmark, query: 'S&P 500' },
        { name: 'Europa', desc: 'DAX, Euro Stoxx, MSCI Europe', icon: Globe, query: 'Europe' },
        { name: 'Schwellenländer', desc: 'MSCI EM, China, Indien', icon: TrendingUp, query: 'Emerging' },
        { name: 'Technologie', desc: 'Tech, AI, Semiconductor', icon: Cpu, query: 'Technology' },
        { name: 'Anleihen', desc: 'Staatsanleihen, Corporate', icon: FileText, query: 'Bond' },
        { name: 'Rohstoffe', desc: 'Gold, Silber, Commodities', icon: Coins, query: 'Gold' }
    ];

    return (
        <div className="search-page">
            <div className="search-header">
                <h1 className="search-title">
                    <SearchIcon size={32} />
                    ETF Suche
                </h1>
                <p className="search-subtitle">
                    Durchsuche tausende ETFs und finde die perfekten für dein Portfolio.
                </p>
            </div>

            <div className="search-bar-container">
                <div className="search-bar">
                    <SearchIcon size={20} className="search-bar-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Symbol oder Name eingeben (z.B. SPY, Vanguard...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {query && (
                        <button
                            className="search-clear"
                            onClick={() => setQuery('')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                {loading && <div className="search-loading">Suche...</div>}
            </div>

            {/* Search Results */}
            {query && results.length > 0 && (
                <section className="search-results-section">
                    <h2 className="results-title">
                        Suchergebnisse
                        <span className="results-count">{results.length} gefunden</span>
                    </h2>
                    <div className="search-results-list">
                        {results.map((result) => {
                            const etfData = getETFFromResult(result);
                            if (etfData) {
                                return <ETFCard key={result.symbol} etf={etfData} />;
                            }
                            return (
                                <Link
                                    key={result.symbol}
                                    to={`/etf/${result.symbol}`}
                                    className="search-result-item"
                                >
                                    <div className="result-info">
                                        <span className="result-symbol">{result.symbol}</span>
                                        <span className="result-name">{result.name}</span>
                                    </div>
                                    <div className="result-meta">
                                        <span className="result-exchange">{result.exchange}</span>
                                        <span className="result-type">{result.type}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* No Results */}
            {query && !loading && results.length === 0 && (
                <div className="no-results">
                    <SearchIcon size={64} strokeWidth={1} />
                    <p>Keine Ergebnisse für "{query}" gefunden</p>
                    <span className="no-results-hint">
                        Versuche einen anderen Suchbegriff oder Symbol.
                    </span>
                </div>
            )}

            {/* Watchlist */}
            {watchlist.length > 0 && !query && (
                <section className="search-section">
                    <h2 className="section-title">
                        <Star size={24} />
                        Deine Watchlist
                    </h2>
                    <div className="etf-grid">
                        {watchlist.map(etf => (
                            <ETFCard key={etf.symbol} etf={etf} />
                        ))}
                    </div>
                </section>
            )}

            {/* Trending ETFs */}
            {!query && (
                <section className="search-section">
                    <h2 className="section-title">
                        <Flame size={24} />
                        Beliebte ETFs
                    </h2>
                    <div className="etf-grid">
                        {trendingETFs.map(etf => (
                            <ETFCard key={etf.symbol} etf={etf} />
                        ))}
                    </div>
                </section>
            )}

            {/* ETF Categories */}
            {!query && (
                <section className="search-section">
                    <h2 className="section-title">
                        <Folder size={24} />
                        ETF Kategorien
                    </h2>
                    <div className="category-grid">
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button key={cat.name} className="category-card" onClick={() => setQuery(cat.query)}>
                                    <div className="category-icon">
                                        <Icon size={28} />
                                    </div>
                                    <span className="category-name">{cat.name}</span>
                                    <span className="category-desc">{cat.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
