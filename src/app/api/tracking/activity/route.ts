import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
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
        const days = parseInt(searchParams.get('days') || '7');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await ActivityLog.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: -1 }).lean();

        return NextResponse.json(logs);
    } catch (error: unknown) {
        console.error('Activity log error:', error);
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

        const log = await ActivityLog.create({
            userId,
            activityType: body.activityType,
            duration: body.duration,
            caloriesBurned: body.caloriesBurned || 0,
            steps: body.steps || 0,
            distance: body.distance || 0,
            date: body.date || new Date(),
            notes: body.notes || '',
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error: unknown) {
        console.error('Activity log create error:', error);
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

        await ActivityLog.deleteOne({ _id: id, userId });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Activity log delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
