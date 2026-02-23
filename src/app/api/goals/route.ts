import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Goal from '@/models/Goal';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;

        const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json(goals);
    } catch (error: unknown) {
        console.error('Goals error:', error);
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

        const goal = await Goal.create({
            userId,
            goalType: body.goalType || 'weight_loss',
            targetWeight: body.targetWeight,
            startWeight: body.startWeight,
            startDate: body.startDate || new Date(),
            targetDate: body.targetDate,
            notes: body.notes || '',
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (error: unknown) {
        console.error('Goal create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as Record<string, unknown>).id as string;
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
        }

        const goal = await Goal.findOneAndUpdate(
            { _id: body.id, userId },
            { status: body.status },
            { new: true }
        );

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        return NextResponse.json(goal);
    } catch (error: unknown) {
        console.error('Goal update error:', error);
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

        await Goal.deleteOne({ _id: id, userId });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Goal delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
