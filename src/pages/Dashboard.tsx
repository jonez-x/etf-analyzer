import { useApp } from '../context/AppContext';
import { ETFCard } from '../components/ETFCard';
import { Link } from 'react-router-dom';
import {
    Search,
    PiggyBank,
    TrendingUp,
    BarChart3,
    Eye,
    Lightbulb,
    Scale,
    PieChart,
    Flame,
    Star,
    ArrowRight,
    Radio
} from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
    const { trendingETFs, loadingTrending, watchlist, savingsPlans } = useApp();

    const marketStats = [
        { label: 'S&P 500', value: '5,123.45', change: '+0.63%', positive: true },
        { label: 'NASDAQ', value: '16,789.12', change: '+1.21%', positive: true },
        { label: 'DAX', value: '18,456.78', change: '-0.34%', positive: false },
        { label: 'EUR/USD', value: '1.0845', change: '+0.12%', positive: true }
    ];

    return (
        <div className="dashboard">
            {/* Hero Section */}
            <section className="dashboard-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span>Dein persönlicher</span>
                        <span className="text-gradient">ETF Analyzer</span>
                    </h1>
                    <p className="hero-subtitle">
                        Analysiere, vergleiche und plane deinen Vermögensaufbau mit ETFs.
                        Live-Daten, intelligente Tools und kluge Entscheidungen.
                    </p>
                    <div className="hero-actions">
                        <Link to="/search" className="btn btn-primary btn-lg">
                            <Search size={18} />
                            ETF Suchen
                        </Link>
                        <Link to="/savings" className="btn btn-secondary btn-lg">
                            <PiggyBank size={18} />
                            Sparplan erstellen
                        </Link>
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                </div>
            </section>

            {/* Market Overview */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <BarChart3 size={24} />
                        Marktübersicht
                    </h2>
                    <span className="section-badge live">
                        <Radio size={12} />
                        Live
                    </span>
                </div>
                <div className="market-stats">
                    {marketStats.map(stat => (
                        <div key={stat.label} className="market-stat-card">
                            <span className="market-stat-label">{stat.label}</span>
                            <span className="market-stat-value">{stat.value}</span>
                            <span className={`market-stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.positive ? <TrendingUp size={14} /> : null}
                                {stat.change}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending ETFs */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <Flame size={24} />
                        Beliebte ETFs
                    </h2>
                    <Link to="/search" className="section-link">
                        Alle anzeigen
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {loadingTrending ? (
                    <div className="loading-grid">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }}></div>
                                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 16 }}></div>
                                <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 16 }}></div>
                                <div className="skeleton" style={{ height: 60, width: '100%' }}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="etf-grid">
                        {trendingETFs.slice(0, 4).map(etf => (
                            <ETFCard key={etf.symbol} etf={etf} />
                        ))}
                    </div>
                )}
            </section>

            {/* Quick Stats */}
            <section className="dashboard-section">
                <div className="quick-stats">
                    <div className="quick-stat-card">
                        <div className="quick-stat-icon">
                            <Eye size={28} />
                        </div>
                        <div className="quick-stat-content">
                            <span className="quick-stat-value">{watchlist.length}</span>
                            <span className="quick-stat-label">Watchlist</span>
                        </div>
                        <Link to="/search" className="quick-stat-action">
                            Verwalten
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="quick-stat-card">
                        <div className="quick-stat-icon">
                            <TrendingUp size={28} />
                        </div>
                        <div className="quick-stat-content">
                            <span className="quick-stat-value">{savingsPlans.length}</span>
                            <span className="quick-stat-label">Sparpläne</span>
                        </div>
                        <Link to="/savings" className="quick-stat-action">
                            Verwalten
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="quick-stat-card highlight">
                        <div className="quick-stat-icon">
                            <Lightbulb size={28} />
                        </div>
                        <div className="quick-stat-content">
                            <span className="quick-stat-label">Tipp des Tages</span>
                            <p className="quick-stat-tip">
                                Diversifiziere dein Portfolio mit ETFs aus verschiedenen Regionen und Sektoren.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Watchlist Preview */}
            {watchlist.length > 0 && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Star size={24} />
                            Deine Watchlist
                        </h2>
                        <Link to="/search" className="section-link">
                            Alle anzeigen
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="watchlist-preview">
                        {watchlist.slice(0, 6).map(etf => (
                            <ETFCard key={etf.symbol} etf={etf} compact />
                        ))}
                    </div>
                </section>
            )}

            {/* Features Overview */}
            <section className="dashboard-section features-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <TrendingUp size={24} />
                        Was du tun kannst
                    </h2>
                </div>
                <div className="features-grid">
                    <Link to="/search" className="feature-card">
                        <div className="feature-icon">
                            <Search size={32} />
                        </div>
                        <h3 className="feature-title">ETF Suche</h3>
                        <p className="feature-desc">
                            Durchsuche tausende ETFs und finde die perfekten für dein Portfolio.
                        </p>
                    </Link>

                    <Link to="/compare" className="feature-card">
                        <div className="feature-icon">
                            <Scale size={32} />
                        </div>
                        <h3 className="feature-title">ETF Vergleich</h3>
                        <p className="feature-desc">
                            Vergleiche bis zu 5 ETFs nebeneinander mit detaillierten Metriken.
                        </p>
                    </Link>

                    <Link to="/savings" className="feature-card">
                        <div className="feature-icon">
                            <PiggyBank size={32} />
                        </div>
                        <h3 className="feature-title">Sparplan</h3>
                        <p className="feature-desc">
                            Erstelle Sparpläne und simuliere dein Vermögenswachstum über Zeit.
                        </p>
                    </Link>

                    <div className="feature-card coming-soon">
                        <div className="feature-icon">
                            <PieChart size={32} />
                        </div>
                        <h3 className="feature-title">Portfolio Analyse</h3>
                        <p className="feature-desc">
                            Analysiere dein Portfolio und optimiere deine Allokation.
                        </p>
                        <span className="coming-soon-badge">Bald verfügbar</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
