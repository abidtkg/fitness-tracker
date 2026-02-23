'use client';

import { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { FiTrendingDown, FiCoffee, FiActivity, FiTrash2, FiZap } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type TabType = 'weight' | 'food' | 'activity';

interface WeightEntry {
    _id: string;
    weight: number;
    unit: string;
    date: string;
    notes: string;
}

interface FoodEntry {
    _id: string;
    mealType: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
}

interface ActivityEntry {
    _id: string;
    activityType: string;
    duration: number;
    caloriesBurned: number;
    steps: number;
    distance: number;
    date: string;
    notes: string;
}

export default function TrackingPage() {
    const [activeTab, setActiveTab] = useState<TabType>('weight');
    const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
    const [foodLogs, setFoodLogs] = useState<FoodEntry[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // Weight form
    const [weight, setWeight] = useState('');
    const [weightNotes, setWeightNotes] = useState('');

    // Food form
    const [mealType, setMealType] = useState('breakfast');
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    // AI estimation
    const [aiLoading, setAiLoading] = useState(false);
    const [aiEstimate, setAiEstimate] = useState<{ foodName: string; calories: number; protein: number; carbs: number; fat: number; servingSize: string } | null>(null);
    const [aiError, setAiError] = useState('');

    // Activity form
    const [activityType, setActivityType] = useState('walking');
    const [duration, setDuration] = useState('');
    const [caloriesBurned, setCaloriesBurned] = useState('');
    const [steps, setSteps] = useState('');
    const [distance, setDistance] = useState('');
    const [activityNotes, setActivityNotes] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'weight') {
                const res = await fetch('/api/tracking/weight?days=30');
                if (res.ok) setWeightLogs(await res.json());
            } else if (activeTab === 'food') {
                const res = await fetch('/api/tracking/food?days=7');
                if (res.ok) setFoodLogs(await res.json());
            } else {
                const res = await fetch('/api/tracking/activity?days=7');
                if (res.ok) setActivityLogs(await res.json());
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    const handleAiEstimate = async () => {
        if (!foodName.trim()) return;
        setAiLoading(true);
        setAiError('');
        setAiEstimate(null);
        try {
            const res = await fetch('/api/ai/nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ foodDescription: foodName }),
            });
            const data = await res.json();
            if (!res.ok) {
                setAiError(data.error || 'AI estimation failed');
                return;
            }
            // Auto-fill the form
            setAiEstimate(data);
            setFoodName(data.foodName || foodName);
            setCalories(data.calories.toString());
            setProtein(data.protein.toString());
            setCarbs(data.carbs.toString());
            setFat(data.fat.toString());
        } catch {
            setAiError('Failed to connect to AI service');
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleWeightSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tracking/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weight: parseFloat(weight), notes: weightNotes }),
            });
            if (res.ok) {
                setWeight('');
                setWeightNotes('');
                fetchData();
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const handleFoodSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tracking/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mealType,
                    foodName,
                    calories: parseInt(calories),
                    protein: parseFloat(protein) || 0,
                    carbs: parseFloat(carbs) || 0,
                    fat: parseFloat(fat) || 0,
                }),
            });
            if (res.ok) {
                setFoodName('');
                setCalories('');
                setProtein('');
                setCarbs('');
                setFat('');
                fetchData();
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tracking/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activityType,
                    duration: parseInt(duration),
                    caloriesBurned: parseInt(caloriesBurned) || 0,
                    steps: parseInt(steps) || 0,
                    distance: parseFloat(distance) || 0,
                    notes: activityNotes,
                }),
            });
            if (res.ok) {
                setDuration('');
                setCaloriesBurned('');
                setSteps('');
                setDistance('');
                setActivityNotes('');
                fetchData();
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        try {
            const res = await fetch(`/api/tracking/${type}?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    // Weight chart data
    const sortedWeights = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const weightChartData = {
        labels: sortedWeights.map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Weight (kg)',
            data: sortedWeights.map(w => w.weight),
            borderColor: '#00E676',
            backgroundColor: 'rgba(0, 230, 118, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00E676',
            pointBorderColor: '#00E676',
            pointRadius: 4,
            pointHoverRadius: 6,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
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
                ticks: { color: 'rgba(232, 245, 233, 0.4)', font: { size: 11 } },
            },
            y: {
                grid: { color: 'rgba(0, 230, 118, 0.06)' },
                ticks: { color: 'rgba(232, 245, 233, 0.4)', font: { size: 11 } },
            },
        },
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1>Tracking</h1>
                    <p>Log and monitor your daily fitness data</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'weight' ? 'active' : ''}`} onClick={() => setActiveTab('weight')}>
                    <FiTrendingDown /> Weight
                </button>
                <button className={`tab ${activeTab === 'food' ? 'active' : ''}`} onClick={() => setActiveTab('food')}>
                    <FiCoffee /> Food Intake
                </button>
                <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                    <FiActivity /> Activity
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
                <div className="tracking-content">
                    {/* ===== WEIGHT TAB ===== */}
                    {activeTab === 'weight' && (
                        <>
                            <div className="card tracking-form">
                                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Log Weight</h3>
                                <form onSubmit={handleWeightSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Weight (kg)</label>
                                        <input type="number" step="0.1" className="form-input" placeholder="e.g. 75.5" value={weight} onChange={e => setWeight(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Notes (optional)</label>
                                        <input type="text" className="form-input" placeholder="Morning weigh-in..." value={weightNotes} onChange={e => setWeightNotes(e.target.value)} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Log Weight</button>
                                </form>
                            </div>
                            <div>
                                {sortedWeights.length > 0 && (
                                    <div className="card chart-container">
                                        <Line data={weightChartData} options={chartOptions} />
                                    </div>
                                )}
                                <div className="card entries-list" style={{ marginTop: 20, padding: 0 }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '0.95rem' }}>Recent Entries</h3>
                                    </div>
                                    {weightLogs.length === 0 ? (
                                        <div className="empty-state"><p>No weight entries yet. Start logging!</p></div>
                                    ) : (
                                        weightLogs.map(entry => (
                                            <div key={entry._id} className="entry-item">
                                                <div className="entry-info">
                                                    <h4>{entry.weight} {entry.unit}</h4>
                                                    <p>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {entry.notes && `• ${entry.notes}`}</p>
                                                </div>
                                                <div className="entry-actions">
                                                    <button onClick={() => handleDelete('weight', entry._id)}><FiTrash2 /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== FOOD TAB ===== */}
                    {activeTab === 'food' && (
                        <>
                            <div className="card tracking-form">
                                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Log Meal</h3>
                                <form onSubmit={handleFoodSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Meal Type</label>
                                        <select className="form-select" value={mealType} onChange={e => setMealType(e.target.value)}>
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Food Name</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input type="text" className="form-input" placeholder="e.g. Biriyani 300g, 2 Roti, Dal" value={foodName} onChange={e => { setFoodName(e.target.value); setAiEstimate(null); setAiError(''); }} required style={{ flex: 1 }} />
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={handleAiEstimate}
                                                disabled={aiLoading || !foodName.trim()}
                                                style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}
                                                title="AI will estimate nutrition for Bangladeshi food"
                                            >
                                                {aiLoading ? (
                                                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Estimating...</>
                                                ) : (
                                                    <><FiZap /> AI Estimate</>
                                                )}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Type food name with quantity (e.g. &quot;biriyani 300g&quot;) and click AI Estimate</p>
                                    </div>

                                    {/* AI Error */}
                                    {aiError && (
                                        <div className="auth-error" style={{ marginBottom: 12 }}>{aiError}</div>
                                    )}

                                    {/* AI Estimate Result */}
                                    {aiEstimate && (
                                        <div style={{
                                            background: 'rgba(0, 230, 118, 0.06)',
                                            border: '1px solid rgba(0, 230, 118, 0.2)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '12px 16px',
                                            marginBottom: 16,
                                            fontSize: '0.8rem',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <FiZap style={{ color: 'var(--green-500)' }} />
                                                <span style={{ color: 'var(--green-500)', fontWeight: 600 }}>AI Estimated — {aiEstimate.servingSize}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)' }}>
                                                <span>🔥 {aiEstimate.calories} kcal</span>
                                                <span>💪 P: {aiEstimate.protein}g</span>
                                                <span>🌾 C: {aiEstimate.carbs}g</span>
                                                <span>🫧 F: {aiEstimate.fat}g</span>
                                            </div>
                                            <p style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Values auto-filled below. Adjust if needed before logging.</p>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Calories (kcal)</label>
                                        <input type="number" className="form-input" placeholder="e.g. 350" value={calories} onChange={e => setCalories(e.target.value)} required style={aiEstimate ? { borderColor: 'rgba(0, 230, 118, 0.4)' } : {}} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                        <div className="form-group">
                                            <label className="form-label">Protein (g)</label>
                                            <input type="number" step="0.1" className="form-input" placeholder="0" value={protein} onChange={e => setProtein(e.target.value)} style={aiEstimate ? { borderColor: 'rgba(0, 230, 118, 0.4)' } : {}} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Carbs (g)</label>
                                            <input type="number" step="0.1" className="form-input" placeholder="0" value={carbs} onChange={e => setCarbs(e.target.value)} style={aiEstimate ? { borderColor: 'rgba(0, 230, 118, 0.4)' } : {}} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Fat (g)</label>
                                            <input type="number" step="0.1" className="form-input" placeholder="0" value={fat} onChange={e => setFat(e.target.value)} style={aiEstimate ? { borderColor: 'rgba(0, 230, 118, 0.4)' } : {}} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Log Meal</button>
                                </form>
                            </div>
                            <div>
                                <div className="card entries-list" style={{ padding: 0 }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '0.95rem' }}>Recent Meals</h3>
                                    </div>
                                    {foodLogs.length === 0 ? (
                                        <div className="empty-state"><p>No meals logged yet. Start tracking!</p></div>
                                    ) : (
                                        foodLogs.map(entry => (
                                            <div key={entry._id} className="entry-item">
                                                <div className="entry-info">
                                                    <h4>{entry.foodName}</h4>
                                                    <p style={{ textTransform: 'capitalize' }}>{entry.mealType} • {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div className="entry-value">{entry.calories} kcal</div>
                                                    <div className="entry-actions">
                                                        <button onClick={() => handleDelete('food', entry._id)}><FiTrash2 /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== ACTIVITY TAB ===== */}
                    {activeTab === 'activity' && (
                        <>
                            <div className="card tracking-form">
                                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Log Activity</h3>
                                <form onSubmit={handleActivitySubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Activity Type</label>
                                        <select className="form-select" value={activityType} onChange={e => setActivityType(e.target.value)}>
                                            <option value="walking">Walking</option>
                                            <option value="running">Running</option>
                                            <option value="cycling">Cycling</option>
                                            <option value="swimming">Swimming</option>
                                            <option value="gym">Gym</option>
                                            <option value="yoga">Yoga</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Duration (minutes)</label>
                                        <input type="number" className="form-input" placeholder="e.g. 30" value={duration} onChange={e => setDuration(e.target.value)} required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <div className="form-group">
                                            <label className="form-label">Calories Burned</label>
                                            <input type="number" className="form-input" placeholder="0" value={caloriesBurned} onChange={e => setCaloriesBurned(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Steps</label>
                                            <input type="number" className="form-input" placeholder="0" value={steps} onChange={e => setSteps(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Distance (km)</label>
                                        <input type="number" step="0.1" className="form-input" placeholder="0" value={distance} onChange={e => setDistance(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Notes (optional)</label>
                                        <input type="text" className="form-input" placeholder="Evening walk..." value={activityNotes} onChange={e => setActivityNotes(e.target.value)} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Log Activity</button>
                                </form>
                            </div>
                            <div>
                                <div className="card entries-list" style={{ padding: 0 }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '0.95rem' }}>Recent Activities</h3>
                                    </div>
                                    {activityLogs.length === 0 ? (
                                        <div className="empty-state"><p>No activities logged yet. Get moving!</p></div>
                                    ) : (
                                        activityLogs.map(entry => (
                                            <div key={entry._id} className="entry-item">
                                                <div className="entry-info">
                                                    <h4 style={{ textTransform: 'capitalize' }}>{entry.activityType}</h4>
                                                    <p>{entry.duration} min • {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {entry.steps > 0 && `${entry.steps.toLocaleString()} steps`}
                                                        {entry.distance > 0 && ` • ${entry.distance} km`}
                                                        {entry.notes && ` • ${entry.notes}`}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div className="entry-value">{entry.caloriesBurned} kcal</div>
                                                    <div className="entry-actions">
                                                        <button onClick={() => handleDelete('activity', entry._id)}><FiTrash2 /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
