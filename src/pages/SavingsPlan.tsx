import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTrendingETFs, calculateSavingsProjection } from '../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import type { ETFQuote, SavingsPlan } from '../types/etf';
import {
    PiggyBank,
    Calculator,
    Plus,
    Trash2,
    TrendingUp,
    Coins,
    CalendarDays,
    Percent,
    Target,
    Info,
    Check
} from 'lucide-react';
import './SavingsPlan.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

export function SavingsPlan() {
    const { savingsPlans, addSavingsPlan, deleteSavingsPlan } = useApp();
    const [availableETFs, setAvailableETFs] = useState<ETFQuote[]>([]);

    // Calculator state
    const [monthlySavings, setMonthlySavings] = useState(200);
    const [duration, setDuration] = useState(10);
    const [expectedReturn, setExpectedReturn] = useState(7);

    // New plan form
    const [showNewPlan, setShowNewPlan] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [selectedETFs, setSelectedETFs] = useState<string[]>([]);

    useEffect(() => {
        async function loadETFs() {
            const etfs = await getTrendingETFs();
            setAvailableETFs(etfs);
        }
        loadETFs();
    }, []);

    // Calculate projection
    const projection = calculateSavingsProjection(monthlySavings, duration, expectedReturn);

    const totalInvested = monthlySavings * 12 * duration;
    const totalGains = projection[projection.length - 1]?.value - totalInvested || 0;
    const finalValue = projection[projection.length - 1]?.value || 0;

    // Chart data
    const chartData = {
        labels: projection.map(p => `J${p.year}`),
        datasets: [
            {
                label: 'Portfolio Wert',
                data: projection.map(p => p.value),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#f97316'
            },
            {
                label: 'Investiert',
                data: projection.map(p => p.invested),
                borderColor: '#3f3f46',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0,
                pointRadius: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: '#a1a1aa',
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderWidth: 1,
                titleColor: '#fafafa',
                bodyColor: '#a1a1aa',
                padding: 12,
                callbacks: {
                    label: (context: any) => {
                        const value = new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(context.raw);
                        return `${context.dataset.label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#71717a' }
            },
            y: {
                grid: { color: 'rgba(63, 63, 70, 0.3)' },
                ticks: {
                    color: '#71717a',
                    callback: (value: number) => `${(value / 1000).toFixed(0)}k €`
                }
            }
        }
    };

    const handleCreatePlan = () => {
        if (!newPlanName || selectedETFs.length === 0) return;

        const newPlan: SavingsPlan = {
            id: Date.now().toString(),
            name: newPlanName,
            monthlySavings,
            duration,
            expectedReturn,
            etfs: selectedETFs.map(symbol => ({
                symbol,
                allocation: 100 / selectedETFs.length
            })),
            createdAt: new Date().toISOString()
        };

        addSavingsPlan(newPlan);
        setShowNewPlan(false);
        setNewPlanName('');
        setSelectedETFs([]);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const getPlanProjection = (plan: SavingsPlan) => {
        const proj = calculateSavingsProjection(plan.monthlySavings, plan.duration, plan.expectedReturn);
        return proj[proj.length - 1]?.value || 0;
    };

    const getAllocationChartData = (plan: SavingsPlan) => ({
        labels: plan.etfs.map(e => e.symbol),
        datasets: [{
            data: plan.etfs.map(e => e.allocation),
            backgroundColor: [
                '#f97316',
                '#22c55e',
                '#3b82f6',
                '#ec4899',
                '#8b5cf6'
            ],
            borderWidth: 0
        }]
    });

    return (
        <div className="savings-page">
            <div className="savings-header">
                <h1 className="savings-title">
                    <PiggyBank size={32} />
                    Sparplan Rechner
                </h1>
                <p className="savings-subtitle">
                    Simuliere dein Vermögenswachstum und erstelle individuelle Sparpläne.
                </p>
            </div>

            {/* Calculator */}
            <div className="calculator-section">
                <div className="calculator-inputs">
                    <div className="calc-input-group">
                        <label className="calc-label">
                            <Coins size={18} />
                            Monatliche Sparrate
                        </label>
                        <div className="calc-slider-container">
                            <input
                                type="range"
                                min="25"
                                max="2000"
                                step="25"
                                value={monthlySavings}
                                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                                className="calc-slider"
                            />
                            <span className="calc-value">{formatCurrency(monthlySavings)}</span>
                        </div>
                    </div>

                    <div className="calc-input-group">
                        <label className="calc-label">
                            <CalendarDays size={18} />
                            Anlagedauer (Jahre)
                        </label>
                        <div className="calc-slider-container">
                            <input
                                type="range"
                                min="1"
                                max="40"
                                step="1"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="calc-slider"
                            />
                            <span className="calc-value">{duration} Jahre</span>
                        </div>
                    </div>

                    <div className="calc-input-group">
                        <label className="calc-label">
                            <Percent size={18} />
                            Erwartete Rendite (p.a.)
                        </label>
                        <div className="calc-slider-container">
                            <input
                                type="range"
                                min="1"
                                max="15"
                                step="0.5"
                                value={expectedReturn}
                                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                                className="calc-slider"
                            />
                            <span className="calc-value">{expectedReturn}%</span>
                        </div>
                    </div>
                </div>

                <div className="calculator-results">
                    <div className="result-card invested">
                        <Coins size={24} />
                        <div className="result-content">
                            <span className="result-label">Eingezahlt</span>
                            <span className="result-value">{formatCurrency(totalInvested)}</span>
                        </div>
                    </div>
                    <div className="result-card gains">
                        <TrendingUp size={24} />
                        <div className="result-content">
                            <span className="result-label">Rendite</span>
                            <span className="result-value positive">{formatCurrency(totalGains)}</span>
                        </div>
                    </div>
                    <div className="result-card total">
                        <Target size={24} />
                        <div className="result-content">
                            <span className="result-label">Endwert</span>
                            <span className="result-value highlight">{formatCurrency(finalValue)}</span>
                        </div>
                    </div>
                </div>

                <div className="calculator-chart">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* New Plan */}
            <div className="new-plan-section">
                {!showNewPlan ? (
                    <button className="btn btn-primary btn-lg new-plan-btn" onClick={() => setShowNewPlan(true)}>
                        <Plus size={20} />
                        Neuen Sparplan erstellen
                    </button>
                ) : (
                    <div className="new-plan-form">
                        <h3 className="form-title">
                            <Calculator size={24} />
                            Neuer Sparplan
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Name des Sparplans</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="z.B. Altersvorsorge"
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ETFs auswählen</label>
                            <div className="etf-select-grid">
                                {availableETFs.map(etf => (
                                    <button
                                        key={etf.symbol}
                                        className={`etf-select-item ${selectedETFs.includes(etf.symbol) ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedETFs(prev =>
                                                prev.includes(etf.symbol)
                                                    ? prev.filter(s => s !== etf.symbol)
                                                    : [...prev, etf.symbol]
                                            );
                                        }}
                                    >
                                        {selectedETFs.includes(etf.symbol) && <Check size={16} />}
                                        <span className="etf-symbol">{etf.symbol}</span>
                                        <span className="etf-name">{etf.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewPlan(false)}>
                                Abbrechen
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreatePlan}
                                disabled={!newPlanName || selectedETFs.length === 0}
                            >
                                <Plus size={16} />
                                Sparplan erstellen
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Saved Plans */}
            {savingsPlans.length > 0 && (
                <div className="saved-plans-section">
                    <h2 className="section-title">
                        <PiggyBank size={24} />
                        Deine Sparpläne ({savingsPlans.length})
                    </h2>

                    <div className="plans-grid">
                        {savingsPlans.map(plan => (
                            <div key={plan.id} className="plan-card">
                                <div className="plan-header">
                                    <h3 className="plan-name">{plan.name}</h3>
                                    <button
                                        className="plan-delete"
                                        onClick={() => deleteSavingsPlan(plan.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="plan-stats">
                                    <div className="plan-stat">
                                        <span className="plan-stat-label">Monatl.</span>
                                        <span className="plan-stat-value">{formatCurrency(plan.monthlySavings)}</span>
                                    </div>
                                    <div className="plan-stat">
                                        <span className="plan-stat-label">Dauer</span>
                                        <span className="plan-stat-value">{plan.duration}J</span>
                                    </div>
                                    <div className="plan-stat">
                                        <span className="plan-stat-label">Rendite</span>
                                        <span className="plan-stat-value">{plan.expectedReturn}%</span>
                                    </div>
                                </div>

                                <div className="plan-projection">
                                    <span className="plan-projection-label">Projektion</span>
                                    <span className="plan-projection-value">
                                        {formatCurrency(getPlanProjection(plan))}
                                    </span>
                                </div>

                                <div className="plan-allocation">
                                    <div className="allocation-chart">
                                        <Doughnut
                                            data={getAllocationChartData(plan)}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: true,
                                                plugins: { legend: { display: false } },
                                                cutout: '65%'
                                            }}
                                        />
                                    </div>
                                    <div className="allocation-list">
                                        {plan.etfs.map((etf, i) => (
                                            <div key={etf.symbol} className="allocation-item">
                                                <div
                                                    className="allocation-color"
                                                    style={{ backgroundColor: ['#f97316', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'][i] }}
                                                ></div>
                                                <span className="allocation-symbol">{etf.symbol}</span>
                                                <span className="allocation-percent">{etf.allocation.toFixed(0)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Note */}
            <div className="info-note">
                <Info size={20} />
                <div className="info-content">
                    <strong>Hinweis:</strong> Diese Simulation basiert auf historischen Durchschnittsrenditen.
                    Die tatsächliche Wertentwicklung kann abweichen. Vergangene Renditen sind keine Garantie für zukünftige Ergebnisse.
                </div>
            </div>
        </div>
    );
}
