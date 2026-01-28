import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard,
    Search,
    Scale,
    PiggyBank
} from 'lucide-react';
import './Header.css';

export function Header() {
    const location = useLocation();
    const { comparisonList } = useApp();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/search', label: 'ETF Suche', icon: Search },
        { path: '/compare', label: 'Vergleich', icon: Scale, badge: comparisonList.length },
        { path: '/savings', label: 'Sparplan', icon: PiggyBank }
    ];

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <img src="/etf_logo.png" alt="ETF Analyzer" className="logo-image" />
                </Link>

                <nav className="nav">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <Icon size={18} />
                                <span className="nav-label">{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <span className="nav-badge">{item.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

