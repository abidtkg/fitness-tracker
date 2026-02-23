import mongoose, { Schema, Document } from 'mongoose';

export interface IWeightLog extends Document {
    userId: string;
    weight: number;
    unit: string;
    date: Date;
    notes: string;
}

const WeightLogSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    weight: {
        type: Number,
        required: [true, 'Please provide weight'],
    },
    unit: {
        type: String,
        default: 'kg',
        enum: ['kg', 'lbs'],
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

export default mongoose.models.WeightLog || mongoose.model<IWeightLog>('WeightLog', WeightLogSchema);
