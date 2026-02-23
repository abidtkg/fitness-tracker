import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodLog extends Document {
    userId: string;
    mealType: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: Date;
}

const FoodLogSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    mealType: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
    foodName: {
        type: String,
        required: [true, 'Please provide food name'],
    },
    calories: {
        type: Number,
        required: [true, 'Please provide calories'],
        min: 0,
    },
    protein: {
        type: Number,
        default: 0,
        min: 0,
    },
    carbs: {
        type: Number,
        default: 0,
        min: 0,
    },
    fat: {
        type: Number,
        default: 0,
        min: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.models.FoodLog || mongoose.model<IFoodLog>('FoodLog', FoodLogSchema);
