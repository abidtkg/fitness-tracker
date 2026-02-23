import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
    userId: string;
    activityType: string;
    duration: number;
    caloriesBurned: number;
    steps: number;
    distance: number;
    date: Date;
    notes: string;
}

const ActivityLogSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    activityType: {
        type: String,
        required: true,
        enum: ['walking', 'running', 'cycling', 'swimming', 'gym', 'yoga', 'other'],
    },
    duration: {
        type: Number,
        required: [true, 'Please provide duration in minutes'],
        min: 0,
    },
    caloriesBurned: {
        type: Number,
        default: 0,
        min: 0,
    },
    steps: {
        type: Number,
        default: 0,
        min: 0,
    },
    distance: {
        type: Number,
        default: 0,
        min: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
