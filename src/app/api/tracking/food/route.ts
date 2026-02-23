import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import FoodLog from '@/models/FoodLog';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await FoodLog.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: -1 }).lean();

        return NextResponse.json(logs);
    } catch (error: unknown) {
        console.error('Food log error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;
        const body = await request.json();

        const log = await FoodLog.create({
            userId,
            mealType: body.mealType,
            foodName: body.foodName,
            calories: body.calories,
            protein: body.protein || 0,
            carbs: body.carbs || 0,
            fat: body.fat || 0,
            date: body.date || new Date(),
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error: unknown) {
        console.error('Food log create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await FoodLog.deleteOne({ _id: id, userId });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Food log delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
