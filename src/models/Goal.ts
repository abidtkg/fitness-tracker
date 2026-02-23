import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
    userId: string;
    goalType: string;
    targetWeight: number;
    startWeight: number;
    startDate: Date;
    targetDate: Date;
    status: string;
    notes: string;
}

const GoalSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    goalType: {
        type: String,
        required: true,
        enum: ['weight_loss', 'weight_gain', 'maintain'],
        default: 'weight_loss',
    },
    targetWeight: {
        type: Number,
        required: [true, 'Please provide target weight'],
    },
    startWeight: {
        type: Number,
        required: [true, 'Please provide start weight'],
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    targetDate: {
        type: Date,
        required: [true, 'Please provide target date'],
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active',
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
