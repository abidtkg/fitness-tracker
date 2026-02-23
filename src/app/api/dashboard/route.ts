import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import WeightLog from '@/models/WeightLog';
import FoodLog from '@/models/FoodLog';
import ActivityLog from '@/models/ActivityLog';
import Goal from '@/models/Goal';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get latest weight
        const latestWeight = await WeightLog.findOne({ userId })
            .sort({ date: -1 })
            .lean();

        // Get today's food calories
        const todayFoods = await FoodLog.find({
            userId,
            date: { $gte: today, $lt: tomorrow },
        }).lean();

        const todayCalories = todayFoods.reduce((sum: number, f: Record<string, unknown>) => sum + (f.calories as number || 0), 0);

        // Get today's activities
        const todayActivities = await ActivityLog.find({
            userId,
            date: { $gte: today, $lt: tomorrow },
        }).lean();

        const todayBurned = todayActivities.reduce((sum: number, a: Record<string, unknown>) => sum + (a.caloriesBurned as number || 0), 0);
        const todaySteps = todayActivities.reduce((sum: number, a: Record<string, unknown>) => sum + (a.steps as number || 0), 0);

        // Active goals count
        const activeGoals = await Goal.countDocuments({ userId, status: 'active' });

        // Recent activities (last 5)
        const recentActivities = await ActivityLog.find({ userId })
            .sort({ date: -1 })
            .limit(5)
            .lean();

        // Recent foods (today)
        const recentFoods = await FoodLog.find({ userId })
            .sort({ date: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({
            currentWeight: latestWeight ? (latestWeight as Record<string, unknown>).weight : null,
            todayCalories,
            todayBurned,
            activeGoals,
            todaySteps,
            recentActivities,
            recentFoods,
        });
    } catch (error: unknown) {
        console.error('Dashboard error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
