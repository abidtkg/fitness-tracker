import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import WeightLog from '@/models/WeightLog';

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

        const logs = await WeightLog.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: -1 }).lean();

        return NextResponse.json(logs);
    } catch (error: unknown) {
        console.error('Weight log error:', error);
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

        const log = await WeightLog.create({
            userId,
            weight: body.weight,
            unit: body.unit || 'kg',
            date: body.date || new Date(),
            notes: body.notes || '',
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error: unknown) {
        console.error('Weight log create error:', error);
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

        await WeightLog.deleteOne({ _id: id, userId });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Weight log delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
