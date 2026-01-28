// ETF API Service using Twelve Data API
// Free tier: 8 API calls per minute, 800 per day

import type {
    ETFQuote,
    ETFSearchResult,
    ETFHistoricalData,
    TimeRange
} from '../types/etf';

// Twelve Data API - Get a free key at https://twelvedata.com/
// Set VITE_TWELVE_DATA_API_KEY in your .env or Vercel environment variables
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY || '';
const BASE_URL = 'https://api.twelvedata.com';

// Alternative: Alpha Vantage API
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo';
const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

function getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }
    return null;
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// Mock data for demo purposes (when API limits are reached)
const mockETFs: ETFQuote[] = [
    {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        price: 512.45,
        change: 3.21,
        changePercent: 0.63,
        previousClose: 509.24,
        open: 510.12,
        high: 514.78,
        low: 509.45,
        volume: 45678900,
        avgVolume: 52340000,
        marketCap: 520000000000,
        fiftyTwoWeekHigh: 525.00,
        fiftyTwoWeekLow: 410.34,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    },
    {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        price: 438.92,
        change: 5.67,
        changePercent: 1.31,
        previousClose: 433.25,
        open: 434.50,
        high: 440.12,
        low: 433.00,
        volume: 32456780,
        avgVolume: 38900000,
        marketCap: 195000000000,
        fiftyTwoWeekHigh: 445.00,
        fiftyTwoWeekLow: 340.56,
        currency: 'USD',
        exchange: 'NASDAQ',
        timestamp: Date.now()
    },
    {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        price: 268.34,
        change: 1.45,
        changePercent: 0.54,
        previousClose: 266.89,
        open: 267.00,
        high: 269.50,
        low: 266.50,
        volume: 3456000,
        avgVolume: 4200000,
        marketCap: 380000000000,
        fiftyTwoWeekHigh: 275.00,
        fiftyTwoWeekLow: 215.78,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    },
    {
        symbol: 'IWM',
        name: 'iShares Russell 2000 ETF',
        price: 205.67,
        change: -1.23,
        changePercent: -0.59,
        previousClose: 206.90,
        open: 207.00,
        high: 208.45,
        low: 204.30,
        volume: 28900000,
        avgVolume: 32000000,
        marketCap: 65000000000,
        fiftyTwoWeekHigh: 225.00,
        fiftyTwoWeekLow: 165.34,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    },
    {
        symbol: 'EFA',
        name: 'iShares MSCI EAFE ETF',
        price: 78.45,
        change: 0.34,
        changePercent: 0.44,
        previousClose: 78.11,
        open: 78.20,
        high: 78.90,
        low: 78.00,
        volume: 12340000,
        avgVolume: 15600000,
        marketCap: 52000000000,
        fiftyTwoWeekHigh: 82.00,
        fiftyTwoWeekLow: 65.45,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    },
    {
        symbol: 'VWO',
        name: 'Vanguard FTSE Emerging Markets ETF',
        price: 43.78,
        change: 0.56,
        changePercent: 1.30,
        previousClose: 43.22,
        open: 43.30,
        high: 44.10,
        low: 43.15,
        volume: 8900000,
        avgVolume: 10500000,
        marketCap: 72000000000,
        fiftyTwoWeekHigh: 48.00,
        fiftyTwoWeekLow: 38.90,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    },
    {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        price: 215.34,
        change: 2.45,
        changePercent: 1.15,
        previousClose: 212.89,
        open: 213.00,
        high: 216.50,
        low: 212.80,
        volume: 6780000,
        avgVolume: 7800000,
        marketCap: 62000000000,
        fiftyTwoWeekHigh: 220.00,
        fiftyTwoWeekLow: 168.45,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    },
    {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        price: 73.12,
        change: -0.15,
        changePercent: -0.20,
        previousClose: 73.27,
        open: 73.20,
        high: 73.45,
        low: 72.90,
        volume: 5670000,
        avgVolume: 6200000,
        marketCap: 98000000000,
        fiftyTwoWeekHigh: 76.00,
        fiftyTwoWeekLow: 70.12,
        currency: 'USD',
        exchange: 'NYSE',
        timestamp: Date.now()
    }
];

// Generate mock historical data
function generateMockHistoricalData(
    basePrice: number,
    days: number,
    volatility: number = 0.02
): ETFHistoricalData[] {
    const data: ETFHistoricalData[] = [];
    let price = basePrice * 0.85; // Start lower for upward trend
    const today = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const change = (Math.random() - 0.48) * volatility * price;
        price = Math.max(price + change, price * 0.5);

        const dailyVolatility = volatility * 0.5;
        const high = price * (1 + Math.random() * dailyVolatility);
        const low = price * (1 - Math.random() * dailyVolatility);
        const open = low + Math.random() * (high - low);
        const close = low + Math.random() * (high - low);

        data.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(Math.random() * 50000000) + 10000000
        });
    }

    return data;
}

function getTimeRangeDays(range: TimeRange): number {
    switch (range) {
        case '1D': return 1;
        case '1W': return 7;
        case '1M': return 30;
        case '3M': return 90;
        case '6M': return 180;
        case '1Y': return 365;
        case '5Y': return 1825;
        case 'MAX': return 3650;
        default: return 365;
    }
}

// API Functions

export async function searchETFs(query: string): Promise<ETFSearchResult[]> {
    const cacheKey = `search_${query}`;
    const cached = getCached<ETFSearchResult[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${API_KEY}`
        );

        if (!response.ok) throw new Error('API error');

        const data = await response.json();

        if (data.data) {
            const results: ETFSearchResult[] = data.data
                .filter((item: { instrument_type: string }) =>
                    item.instrument_type === 'ETF' || item.instrument_type === 'Common Stock'
                )
                .slice(0, 10)
                .map((item: { symbol: string; instrument_name: string; exchange: string; instrument_type: string; country: string; currency: string }) => ({
                    symbol: item.symbol,
                    name: item.instrument_name,
                    exchange: item.exchange,
                    type: item.instrument_type,
                    country: item.country,
                    currency: item.currency
                }));

            setCache(cacheKey, results);
            return results;
        }

        throw new Error('No data');
    } catch {
        // Fallback to mock data
        const mockResults = mockETFs
            .filter(etf =>
                etf.symbol.toLowerCase().includes(query.toLowerCase()) ||
                etf.name.toLowerCase().includes(query.toLowerCase())
            )
            .map(etf => ({
                symbol: etf.symbol,
                name: etf.name,
                exchange: etf.exchange,
                type: 'ETF',
                country: 'US',
                currency: etf.currency
            }));

        return mockResults;
    }
}

export async function getETFQuote(symbol: string): Promise<ETFQuote | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = getCached<ETFQuote>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`
        );

        if (!response.ok) throw new Error('API error');

        const data = await response.json();

        if (data && !data.code) {
            const quote: ETFQuote = {
                symbol: data.symbol,
                name: data.name,
                price: parseFloat(data.close),
                change: parseFloat(data.change),
                changePercent: parseFloat(data.percent_change),
                previousClose: parseFloat(data.previous_close),
                open: parseFloat(data.open),
                high: parseFloat(data.high),
                low: parseFloat(data.low),
                volume: parseInt(data.volume),
                avgVolume: parseInt(data.average_volume) || 0,
                marketCap: 0,
                fiftyTwoWeekHigh: parseFloat(data.fifty_two_week?.high) || 0,
                fiftyTwoWeekLow: parseFloat(data.fifty_two_week?.low) || 0,
                currency: data.currency || 'USD',
                exchange: data.exchange || 'NYSE',
                timestamp: Date.now()
            };

            setCache(cacheKey, quote);
            return quote;
        }

        throw new Error('No data');
    } catch {
        // Fallback to mock data
        const mockQuote = mockETFs.find(
            etf => etf.symbol.toLowerCase() === symbol.toLowerCase()
        );

        return mockQuote || null;
    }
}

export async function getETFHistoricalData(
    symbol: string,
    range: TimeRange
): Promise<ETFHistoricalData[]> {
    const cacheKey = `history_${symbol}_${range}`;
    const cached = getCached<ETFHistoricalData[]>(cacheKey);
    if (cached) return cached;

    const days = getTimeRangeDays(range);
    const interval = days <= 7 ? '1h' : days <= 90 ? '1day' : '1week';

    try {
        const response = await fetch(
            `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${Math.min(days, 5000)}&apikey=${API_KEY}`
        );

        if (!response.ok) throw new Error('API error');

        const data = await response.json();

        if (data.values) {
            const historicalData: ETFHistoricalData[] = data.values
                .map((item: { datetime: string; open: string; high: string; low: string; close: string; volume: string }) => ({
                    date: item.datetime,
                    open: parseFloat(item.open),
                    high: parseFloat(item.high),
                    low: parseFloat(item.low),
                    close: parseFloat(item.close),
                    volume: parseInt(item.volume)
                }))
                .reverse();

            setCache(cacheKey, historicalData);
            return historicalData;
        }

        throw new Error('No data');
    } catch {
        // Fallback to mock data
        const mockQuote = mockETFs.find(
            etf => etf.symbol.toLowerCase() === symbol.toLowerCase()
        );
        const basePrice = mockQuote?.price || 100;

        return generateMockHistoricalData(basePrice, days);
    }
}

export async function getMultipleETFQuotes(symbols: string[]): Promise<ETFQuote[]> {
    const quotes = await Promise.all(
        symbols.map(symbol => getETFQuote(symbol))
    );

    return quotes.filter((quote): quote is ETFQuote => quote !== null);
}

export async function getTrendingETFs(): Promise<ETFQuote[]> {
    // Return mock trending ETFs
    const trendingSymbols = ['SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'VWO', 'GLD', 'BND'];
    return getMultipleETFQuotes(trendingSymbols);
}

// Calculate performance metrics
export function calculatePerformance(historicalData: ETFHistoricalData[]): {
    change1d: number;
    change1w: number;
    change1m: number;
    change3m: number;
    change6m: number;
    change1y: number;
    volatility: number;
} {
    if (historicalData.length < 2) {
        return { change1d: 0, change1w: 0, change1m: 0, change3m: 0, change6m: 0, change1y: 0, volatility: 0 };
    }

    const currentPrice = historicalData[historicalData.length - 1].close;

    const getChangePercent = (daysAgo: number): number => {
        const index = Math.max(0, historicalData.length - daysAgo - 1);
        const oldPrice = historicalData[index].close;
        return ((currentPrice - oldPrice) / oldPrice) * 100;
    };

    // Calculate volatility (standard deviation of daily returns)
    const returns: number[] = [];
    for (let i = 1; i < historicalData.length; i++) {
        const dailyReturn = (historicalData[i].close - historicalData[i - 1].close) / historicalData[i - 1].close;
        returns.push(dailyReturn);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    return {
        change1d: getChangePercent(1),
        change1w: getChangePercent(5),
        change1m: getChangePercent(22),
        change3m: getChangePercent(66),
        change6m: getChangePercent(132),
        change1y: getChangePercent(252),
        volatility: parseFloat(volatility.toFixed(2))
    };
}

// Savings projection calculation
export interface SavingsProjectionPoint {
    year: number;
    invested: number;
    value: number;
    gains: number;
}

export function calculateSavingsProjection(
    monthlySavings: number,
    durationYears: number,
    expectedReturnPercent: number
): SavingsProjectionPoint[] {
    const projection: SavingsProjectionPoint[] = [];
    const monthlyReturn = expectedReturnPercent / 100 / 12;

    let totalValue = 0;

    for (let year = 1; year <= durationYears; year++) {
        // Calculate for each month of the year
        for (let month = 0; month < 12; month++) {
            totalValue = (totalValue + monthlySavings) * (1 + monthlyReturn);
        }

        const invested = monthlySavings * 12 * year;
        const gains = totalValue - invested;

        projection.push({
            year,
            invested: Math.round(invested),
            value: Math.round(totalValue),
            gains: Math.round(gains)
        });
    }

    return projection;
}

export { mockETFs };

