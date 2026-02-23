'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

interface GoalData {
    _id: string;
    goalType: string;
    targetWeight: number;
    startWeight: number;
    startDate: string;
    targetDate: string;
    status: string;
    notes: string;
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<GoalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [latestWeight, setLatestWeight] = useState<number | null>(null);

    // Form state
    const [goalType, setGoalType] = useState('weight_loss');
    const [targetWeight, setTargetWeight] = useState('');
    const [startWeight, setStartWeight] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [notes, setNotes] = useState('');

    const fetchGoals = useCallback(async () => {
        try {
            const res = await fetch('/api/goals');
            if (res.ok) setGoals(await res.json());
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLatestWeight = useCallback(async () => {
        try {
            const res = await fetch('/api/tracking/weight?days=7');
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setLatestWeight(data[0].weight);
                    setStartWeight(data[0].weight.toString());
                }
            }
        } catch (err) {
            console.error('Fetch weight error:', err);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
        fetchLatestWeight();
    }, [fetchGoals, fetchLatestWeight]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goalType,
                    targetWeight: parseFloat(targetWeight),
                    startWeight: parseFloat(startWeight),
                    targetDate,
                    notes,
                }),
            });
            if (res.ok) {
                setShowForm(false);
                setTargetWeight('');
                setNotes('');
                fetchGoals();
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const updateGoalStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) fetchGoals();
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchGoals();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const calculateProgress = (goal: GoalData) => {
        const currentWeight = latestWeight || goal.startWeight;
        const totalChange = Math.abs(goal.startWeight - goal.targetWeight);
        if (totalChange === 0) return 100;
        const currentChange = Math.abs(goal.startWeight - currentWeight);
        return Math.min(100, Math.round((currentChange / totalChange) * 100));
    };

    const getDaysRemaining = (targetDate: string) => {
        const target = new Date(targetDate);
        const today = new Date();
        const diff = target.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getGoalTypeLabel = (type: string) => {
        switch (type) {
            case 'weight_loss': return 'Weight Loss';
            case 'weight_gain': return 'Weight Gain';
            case 'maintain': return 'Maintain Weight';
            default: return type;
        }
    };

    if (loading) {
        return <div className="loading-spinner"><div className="spinner" /></div>;
    }

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1>Goals</h1>
                    <p>Set targets and track your progress</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                    <FiPlus /> New Goal
                </button>
            </div>

            {/* New Goal Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24, maxWidth: 600 }}>
                    <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Create New Goal</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Goal Type</label>
                            <select className="form-select" value={goalType} onChange={e => setGoalType(e.target.value)}>
                                <option value="weight_loss">Lose Weight</option>
                                <option value="weight_gain">Gain Weight</option>
                                <option value="maintain">Maintain Weight</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Start Weight (kg)</label>
                                <input type="number" step="0.1" className="form-input" value={startWeight} onChange={e => setStartWeight(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Weight (kg)</label>
                                <input type="number" step="0.1" className="form-input" placeholder="e.g. 70" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Target Date</label>
                            <input type="date" className="form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes (optional)</label>
                            <input type="text" className="form-input" placeholder="My summer body goal..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="submit" className="btn btn-primary">Create Goal</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">🎯</div>
                    <h3>No goals yet</h3>
                    <p>Create your first fitness goal to start tracking progress!</p>
                </div>
            ) : (
                <div className="goals-grid">
                    {goals.map(goal => {
                        const progress = calculateProgress(goal);
                        const daysLeft = getDaysRemaining(goal.targetDate);
                        const currentWeight = latestWeight || goal.startWeight;

                        return (
                            <div key={goal._id} className="card goal-card">
                                <div className="goal-header">
                                    <div>
                                        <span className={`badge ${goal.status === 'active' ? 'badge-green' : goal.status === 'completed' ? 'badge-yellow' : 'badge-red'}`}>
                                            {goal.status}
                                        </span>
                                        <h3 style={{ marginTop: 8 }}>{getGoalTypeLabel(goal.goalType)}</h3>
                                        {goal.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{goal.notes}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {goal.status === 'active' && (
                                            <button className="btn btn-sm" style={{ background: 'rgba(0,230,118,0.1)', border: 'none', color: 'var(--green-500)', padding: '6px 8px' }} onClick={() => updateGoalStatus(goal._id, 'completed')} title="Mark Complete">
                                                <FiCheck />
                                            </button>
                                        )}
                                        {goal.status === 'active' && (
                                            <button className="btn btn-sm" style={{ background: 'rgba(244,67,54,0.1)', border: 'none', color: '#f44336', padding: '6px 8px' }} onClick={() => updateGoalStatus(goal._id, 'abandoned')} title="Abandon">
                                                <FiX />
                                            </button>
                                        )}
                                        <button className="btn btn-sm" style={{ background: 'rgba(244,67,54,0.1)', border: 'none', color: '#f44336', padding: '6px 8px' }} onClick={() => deleteGoal(goal._id)} title="Delete">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="goal-progress-bar">
                                    <div className="goal-progress-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {progress}% progress
                                </div>

                                {/* Stats */}
                                <div className="goal-stats">
                                    <div className="goal-stat">
                                        <div className="label">Start</div>
                                        <div className="value">{goal.startWeight} kg</div>
                                    </div>
                                    <div className="goal-stat">
                                        <div className="label">Current</div>
                                        <div className="value text-green">{currentWeight} kg</div>
                                    </div>
                                    <div className="goal-stat">
                                        <div className="label">Target</div>
                                        <div className="value">{goal.targetWeight} kg</div>
                                    </div>
                                </div>

                                {goal.status === 'active' && (
                                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Target date passed'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
