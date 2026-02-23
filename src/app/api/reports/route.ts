import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import WeightLog from '@/models/WeightLog';
import FoodLog from '@/models/FoodLog';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Weight data
        const weights = await WeightLog.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: 1 }).lean();

        // Food data
        const foods = await FoodLog.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: 1 }).lean();

        // Activity data
        const activities = await ActivityLog.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: 1 }).lean();

        // Calculate daily calorie intake
        const dailyCalories: Record<string, number> = {};
        const dailyProtein: Record<string, number> = {};
        const dailyCarbs: Record<string, number> = {};
        const dailyFat: Record<string, number> = {};

        foods.forEach((food: Record<string, unknown>) => {
            const date = new Date(food.date as string).toISOString().split('T')[0];
            dailyCalories[date] = (dailyCalories[date] || 0) + (food.calories as number || 0);
            dailyProtein[date] = (dailyProtein[date] || 0) + (food.protein as number || 0);
            dailyCarbs[date] = (dailyCarbs[date] || 0) + (food.carbs as number || 0);
            dailyFat[date] = (dailyFat[date] || 0) + (food.fat as number || 0);
        });

        // Calculate daily calories burned
        const dailyBurned: Record<string, number> = {};
        const dailySteps: Record<string, number> = {};
        const dailyDistance: Record<string, number> = {};
        const dailyDuration: Record<string, number> = {};

        activities.forEach((act: Record<string, unknown>) => {
            const date = new Date(act.date as string).toISOString().split('T')[0];
            dailyBurned[date] = (dailyBurned[date] || 0) + (act.caloriesBurned as number || 0);
            dailySteps[date] = (dailySteps[date] || 0) + (act.steps as number || 0);
            dailyDistance[date] = (dailyDistance[date] || 0) + (act.distance as number || 0);
            dailyDuration[date] = (dailyDuration[date] || 0) + (act.duration as number || 0);
        });

        // Total macros
        const totalProtein = Object.values(dailyProtein).reduce((a, b) => a + b, 0);
        const totalCarbs = Object.values(dailyCarbs).reduce((a, b) => a + b, 0);
        const totalFat = Object.values(dailyFat).reduce((a, b) => a + b, 0);

        // Summary stats
        const totalCaloriesIntake = Object.values(dailyCalories).reduce((a, b) => a + b, 0);
        const totalCaloriesBurned = Object.values(dailyBurned).reduce((a, b) => a + b, 0);
        const totalSteps = Object.values(dailySteps).reduce((a, b) => a + b, 0);
        const totalDistanceVal = Object.values(dailyDistance).reduce((a, b) => a + b, 0);
        const totalDuration = Object.values(dailyDuration).reduce((a, b) => a + b, 0);
        const activeDays = new Set([...Object.keys(dailyCalories), ...Object.keys(dailyBurned)]).size;

        const avgCalories = activeDays > 0 ? Math.round(totalCaloriesIntake / activeDays) : 0;
        const avgBurned = activeDays > 0 ? Math.round(totalCaloriesBurned / activeDays) : 0;

        return NextResponse.json({
            weights,
            dailyCalories,
            dailyBurned,
            macros: {
                protein: totalProtein,
                carbs: totalCarbs,
                fat: totalFat,
            },
            summary: {
                totalCaloriesIntake,
                totalCaloriesBurned,
                avgCalories,
                avgBurned,
                totalSteps,
                totalDistance: totalDistanceVal,
                totalDuration,
                activeDays,
            },
        });
    } catch (error: unknown) {
        console.error('Reports error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
