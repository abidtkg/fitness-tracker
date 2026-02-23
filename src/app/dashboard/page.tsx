'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FiTrendingDown, FiZap, FiTarget, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

interface DashboardData {
    currentWeight: number | null;
    todayCalories: number;
    todayBurned: number;
    activeGoals: number;
    todaySteps: number;
    recentWeights: { date: string; weight: number }[];
    recentActivities: { activityType: string; duration: number; date: string; caloriesBurned: number }[];
    recentFoods: { foodName: string; calories: number; mealType: string; date: string }[];
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    const stats = [
        {
            label: 'Current Weight',
            value: data?.currentWeight ? `${data.currentWeight} kg` : '-- kg',
            icon: <FiTrendingDown />,
            change: null,
        },
        {
            label: 'Calories Today',
            value: `${data?.todayCalories || 0} kcal`,
            icon: <FiZap />,
            change: null,
        },
        {
            label: 'Active Goals',
            value: `${data?.activeGoals || 0}`,
            icon: <FiTarget />,
            change: null,
        },
        {
            label: 'Steps Today',
            value: `${(data?.todaySteps || 0).toLocaleString()}`,
            icon: <FiActivity />,
            change: null,
        },
    ];

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {session?.user?.name?.split(' ')[0] || 'User'} 👋</h1>
                    <p>Here&apos;s your fitness overview for today</p>
                </div>
                <Link href="/dashboard/tracking" className="btn btn-primary btn-sm">
                    + Log Entry
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="card stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Recent Activity */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1rem' }}>Recent Activity</h3>
                    </div>
                    {data?.recentActivities && data.recentActivities.length > 0 ? (
                        <div>
                            {data.recentActivities.map((activity, i) => (
                                <div key={i} className="entry-item">
                                    <div className="entry-info">
                                        <h4 style={{ textTransform: 'capitalize' }}>{activity.activityType}</h4>
                                        <p>{activity.duration} min • {new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="entry-value">{activity.caloriesBurned} kcal</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🏃</div>
                            <h3>No activities yet</h3>
                            <p>Start tracking your workouts!</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Link href="/dashboard/tracking" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                                ⚖️ Log Weight
                            </Link>
                            <Link href="/dashboard/tracking" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                                🍽️ Log Meal
                            </Link>
                            <Link href="/dashboard/tracking" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                                🚶 Log Activity
                            </Link>
                            <Link href="/dashboard/goals" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                                🎯 Set Goal
                            </Link>
                        </div>
                    </div>

                    {/* Today's Meals */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1rem' }}>Today&apos;s Meals</h3>
                        </div>
                        {data?.recentFoods && data.recentFoods.length > 0 ? (
                            <div>
                                {data.recentFoods.slice(0, 4).map((food, i) => (
                                    <div key={i} className="entry-item" style={{ padding: '12px 24px' }}>
                                        <div className="entry-info">
                                            <h4>{food.foodName}</h4>
                                            <p style={{ textTransform: 'capitalize' }}>{food.mealType}</p>
                                        </div>
                                        <div className="entry-value" style={{ fontSize: '0.95rem' }}>{food.calories} kcal</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '30px 20px' }}>
                                <p>No meals logged today</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
