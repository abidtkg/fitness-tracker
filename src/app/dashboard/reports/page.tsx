'use client';

import { useState, useEffect, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { FiTrendingUp, FiZap, FiActivity, FiPieChart } from 'react-icons/fi';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

interface ReportData {
    weights: { weight: number; date: string }[];
    dailyCalories: Record<string, number>;
    dailyBurned: Record<string, number>;
    macros: { protein: number; carbs: number; fat: number };
    summary: {
        totalCaloriesIntake: number;
        totalCaloriesBurned: number;
        avgCalories: number;
        avgBurned: number;
        totalSteps: number;
        totalDistance: number;
        totalDuration: number;
        activeDays: number;
    };
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?days=${days}`);
            if (res.ok) setData(await res.json());
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const chartColors = {
        green: '#00E676',
        greenLight: 'rgba(0, 230, 118, 0.1)',
        orange: '#FF9800',
        orangeLight: 'rgba(255, 152, 0, 0.1)',
        blue: '#42A5F5',
        red: '#EF5350',
        purple: '#AB47BC',
    };

    const baseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: 'rgba(232, 245, 233, 0.6)', font: { size: 11 } },
            },
            tooltip: {
                backgroundColor: '#111a16',
                titleColor: '#e8f5e9',
                bodyColor: '#e8f5e9',
                borderColor: 'rgba(0, 230, 118, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(0, 230, 118, 0.06)' },
                ticks: { color: 'rgba(232, 245, 233, 0.4)', font: { size: 10 } },
            },
            y: {
                grid: { color: 'rgba(0, 230, 118, 0.06)' },
                ticks: { color: 'rgba(232, 245, 233, 0.4)', font: { size: 10 } },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: 'rgba(232, 245, 233, 0.6)', font: { size: 11 }, padding: 16 },
            },
            tooltip: {
                backgroundColor: '#111a16',
                titleColor: '#e8f5e9',
                bodyColor: '#e8f5e9',
                borderColor: 'rgba(0, 230, 118, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
    };

    // Weight trend chart
    const weightChartData = data ? {
        labels: data.weights.map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Weight (kg)',
            data: data.weights.map(w => w.weight),
            borderColor: chartColors.green,
            backgroundColor: chartColors.greenLight,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
        }],
    } : null;

    // Calorie chart (intake vs burn)
    const calorieDates = data ? [...new Set([...Object.keys(data.dailyCalories), ...Object.keys(data.dailyBurned)])].sort() : [];
    const calorieChartData = data ? {
        labels: calorieDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Intake',
                data: calorieDates.map(d => data.dailyCalories[d] || 0),
                backgroundColor: 'rgba(0, 230, 118, 0.7)',
                borderRadius: 4,
            },
            {
                label: 'Burned',
                data: calorieDates.map(d => data.dailyBurned[d] || 0),
                backgroundColor: 'rgba(255, 152, 0, 0.7)',
                borderRadius: 4,
            },
        ],
    } : null;

    // Macros chart
    const macrosChartData = data ? {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [{
            data: [data.macros.protein, data.macros.carbs, data.macros.fat],
            backgroundColor: [chartColors.green, chartColors.blue, chartColors.orange],
            borderColor: ['transparent', 'transparent', 'transparent'],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    } : null;

    if (loading) {
        return <div className="loading-spinner"><div className="spinner" /></div>;
    }

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1>Reports & Analysis</h1>
                    <p>Comprehensive insights into your fitness journey</p>
                </div>
                <div className="date-range">
                    {[7, 30, 90, 365].map(d => (
                        <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>
                            {d === 7 ? '7D' : d === 30 ? '30D' : d === 90 ? '90D' : '1Y'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards" style={{ marginBottom: 24 }}>
                <div className="summary-card">
                    <div className="label">Total Calories Intake</div>
                    <div className="value text-gradient">{(data?.summary.totalCaloriesIntake || 0).toLocaleString()} kcal</div>
                    <div className="change" style={{ color: 'var(--text-muted)' }}>Avg: {data?.summary.avgCalories || 0} kcal/day</div>
                </div>
                <div className="summary-card">
                    <div className="label">Total Calories Burned</div>
                    <div className="value" style={{ color: chartColors.orange }}>{(data?.summary.totalCaloriesBurned || 0).toLocaleString()} kcal</div>
                    <div className="change" style={{ color: 'var(--text-muted)' }}>Avg: {data?.summary.avgBurned || 0} kcal/day</div>
                </div>
                <div className="summary-card">
                    <div className="label">Total Steps</div>
                    <div className="value">{(data?.summary.totalSteps || 0).toLocaleString()}</div>
                    <div className="change" style={{ color: 'var(--text-muted)' }}>{(data?.summary.totalDistance || 0).toFixed(1)} km total distance</div>
                </div>
                <div className="summary-card">
                    <div className="label">Active Days</div>
                    <div className="value">{data?.summary.activeDays || 0}</div>
                    <div className="change" style={{ color: 'var(--text-muted)' }}>{data?.summary.totalDuration || 0} min total exercise</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="reports-grid">
                {/* Weight Trend */}
                <div className="card report-card">
                    <h3><FiTrendingUp /> Weight Trend</h3>
                    {weightChartData && weightChartData.labels.length > 0 ? (
                        <div className="h-[220px] md:h-[280px]">
                            <Line data={weightChartData} options={baseChartOptions} />
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <p>No weight data for this period</p>
                        </div>
                    )}
                </div>

                {/* Calorie Analysis */}
                <div className="card report-card">
                    <h3><FiZap /> Calorie Analysis</h3>
                    {calorieChartData && calorieChartData.labels.length > 0 ? (
                        <div className="h-[220px] md:h-[280px]">
                            <Bar data={calorieChartData} options={baseChartOptions} />
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <p>No calorie data for this period</p>
                        </div>
                    )}
                </div>

                {/* Macros Breakdown */}
                <div className="card report-card">
                    <h3><FiPieChart /> Macros Breakdown</h3>
                    {macrosChartData && (data?.macros.protein || data?.macros.carbs || data?.macros.fat) ? (
                        <div className="h-[220px] md:h-[280px] flex items-center justify-center">
                            <Doughnut data={macrosChartData} options={doughnutOptions} />
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <p>No macro data for this period</p>
                        </div>
                    )}
                    {data && (data.macros.protein > 0 || data.macros.carbs > 0 || data.macros.fat > 0) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protein</div>
                                <div style={{ fontWeight: 700, color: chartColors.green }}>{Math.round(data.macros.protein)}g</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbs</div>
                                <div style={{ fontWeight: 700, color: chartColors.blue }}>{Math.round(data.macros.carbs)}g</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fat</div>
                                <div style={{ fontWeight: 700, color: chartColors.orange }}>{Math.round(data.macros.fat)}g</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Activity Summary */}
                <div className="card report-card">
                    <h3><FiActivity /> Activity Summary</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
                        <div className="summary-card">
                            <div className="label">Total Steps</div>
                            <div className="value text-base md:text-xl">{(data?.summary.totalSteps || 0).toLocaleString()}</div>
                        </div>
                        <div className="summary-card">
                            <div className="label">Total Distance</div>
                            <div className="value text-base md:text-xl">{(data?.summary.totalDistance || 0).toFixed(1)} km</div>
                        </div>
                        <div className="summary-card">
                            <div className="label">Exercise Time</div>
                            <div className="value text-base md:text-xl">{data?.summary.totalDuration || 0} min</div>
                        </div>
                        <div className="summary-card">
                            <div className="label">Active Days</div>
                            <div className="value text-base md:text-xl">{data?.summary.activeDays || 0} days</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
