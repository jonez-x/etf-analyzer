// ETF Data Types

export interface ETFQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  exchange: string;
  timestamp: number;
}

export interface ETFHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ETFSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  country: string;
  currency: string;
}

export interface ETFDetails extends ETFQuote {
  description?: string;
  sector?: string;
  category?: string;
  expenseRatio?: number;
  dividendYield?: number;
  beta?: number;
  historicalData?: ETFHistoricalData[];
}

export interface SavingsPlan {
  id: string;
  name: string;
  etfs: SavingsPlanETF[];
  monthlyAmount: number;
  startDate: string;
  projectedYears: number;
  expectedReturn: number; // Annual return percentage
  createdAt: string;
  updatedAt: string;
}

export interface SavingsPlanETF {
  symbol: string;
  name: string;
  allocation: number; // Percentage 0-100
  currentPrice?: number;
}

export interface SavingsPlanProjection {
  year: number;
  totalInvested: number;
  projectedValue: number;
  projectedGain: number;
  projectedGainPercent: number;
}

export interface ComparisonData {
  symbol: string;
  name: string;
  price: number;
  change1d: number;
  change1w: number;
  change1m: number;
  change3m: number;
  change6m: number;
  change1y: number;
  changeYTD: number;
  volatility: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  historicalData: ETFHistoricalData[];
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';

export interface ChartDataPoint {
  x: Date | string;
  y: number;
}

export interface PortfolioAllocation {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}
