import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ETFQuote, SavingsPlan } from '../types/etf';
import { getTrendingETFs } from '../services/api';

interface AppContextType {
    // ETF Data
    watchlist: ETFQuote[];
    addToWatchlist: (etf: ETFQuote) => void;
    removeFromWatchlist: (symbol: string) => void;
    isInWatchlist: (symbol: string) => boolean;

    // Comparison
    comparisonList: string[];
    addToComparison: (symbol: string) => void;
    removeFromComparison: (symbol: string) => void;
    clearComparison: () => void;
    isInComparison: (symbol: string) => boolean;

    // Savings Plans
    savingsPlans: SavingsPlan[];
    createSavingsPlan: (plan: Omit<SavingsPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSavingsPlan: (id: string, updates: Partial<SavingsPlan>) => void;
    deleteSavingsPlan: (id: string) => void;

    // Trending
    trendingETFs: ETFQuote[];
    loadingTrending: boolean;

    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
    WATCHLIST: 'etf_watchlist',
    COMPARISON: 'etf_comparison',
    SAVINGS_PLANS: 'etf_savings_plans',
    THEME: 'etf_theme'
};

export function AppProvider({ children }: { children: ReactNode }) {
    // Watchlist State
    const [watchlist, setWatchlist] = useState<ETFQuote[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        return saved ? JSON.parse(saved) : [];
    });

    // Comparison State
    const [comparisonList, setComparisonList] = useState<string[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.COMPARISON);
        return saved ? JSON.parse(saved) : [];
    });

    // Savings Plans State
    const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS_PLANS);
        return saved ? JSON.parse(saved) : [];
    });

    // Trending ETFs
    const [trendingETFs, setTrendingETFs] = useState<ETFQuote[]>([]);
    const [loadingTrending, setLoadingTrending] = useState(true);

    // Theme
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME);
        return (saved as 'dark' | 'light') || 'dark';
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    }, [watchlist]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMPARISON, JSON.stringify(comparisonList));
    }, [comparisonList]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SAVINGS_PLANS, JSON.stringify(savingsPlans));
    }, [savingsPlans]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Load trending ETFs
    useEffect(() => {
        async function loadTrending() {
            setLoadingTrending(true);
            try {
                const etfs = await getTrendingETFs();
                setTrendingETFs(etfs);
            } catch (error) {
                console.error('Failed to load trending ETFs:', error);
            } finally {
                setLoadingTrending(false);
            }
        }
        loadTrending();
    }, []);

    // Watchlist functions
    const addToWatchlist = (etf: ETFQuote) => {
        if (!watchlist.some(item => item.symbol === etf.symbol)) {
            setWatchlist(prev => [...prev, etf]);
        }
    };

    const removeFromWatchlist = (symbol: string) => {
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
    };

    const isInWatchlist = (symbol: string) => {
        return watchlist.some(item => item.symbol === symbol);
    };

    // Comparison functions
    const addToComparison = (symbol: string) => {
        if (comparisonList.length < 5 && !comparisonList.includes(symbol)) {
            setComparisonList(prev => [...prev, symbol]);
        }
    };

    const removeFromComparison = (symbol: string) => {
        setComparisonList(prev => prev.filter(s => s !== symbol));
    };

    const clearComparison = () => {
        setComparisonList([]);
    };

    const isInComparison = (symbol: string) => {
        return comparisonList.includes(symbol);
    };

    // Savings Plan functions
    const createSavingsPlan = (plan: Omit<SavingsPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newPlan: SavingsPlan = {
            ...plan,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setSavingsPlans(prev => [...prev, newPlan]);
    };

    const updateSavingsPlan = (id: string, updates: Partial<SavingsPlan>) => {
        setSavingsPlans(prev =>
            prev.map(plan =>
                plan.id === id
                    ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
                    : plan
            )
        );
    };

    const deleteSavingsPlan = (id: string) => {
        setSavingsPlans(prev => prev.filter(plan => plan.id !== id));
    };

    // Theme function
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value: AppContextType = {
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        savingsPlans,
        createSavingsPlan,
        updateSavingsPlan,
        deleteSavingsPlan,
        trendingETFs,
        loadingTrending,
        theme,
        toggleTheme
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
