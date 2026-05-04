import { Schema, model, Document } from 'mongoose';
import { MealType } from './InternalOrder';

interface IMealStatus {
  stopped: boolean;
  removed: boolean;
}

export interface ISlotDate extends Document {
  date: string;
  meals: MealType[];
  stopped: boolean;
  isFestival: boolean;
  festivalName?: string;
  mealStatus: {
    Breakfast: IMealStatus;
    Lunch: IMealStatus;
    Dinner: IMealStatus;
  };
  priceOverrides: {
    Breakfast?: number;
    Lunch?: number;
    Dinner?: number;
  };
  slotLimits?: {
    Thiruvanmiyur?: { Breakfast?: number; Lunch?: number; Dinner?: number };
    NLBR?: { Breakfast?: number; Lunch?: number; Dinner?: number };
  };
}

const mealStatusSchema = new Schema<IMealStatus>(
  { stopped: { type: Boolean, default: false }, removed: { type: Boolean, default: false } },
  { _id: false }
);

const slotDateSchema = new Schema<ISlotDate>(
  {
    date:         { type: String, required: true },
    meals:        { type: [String], enum: ['Breakfast', 'Lunch', 'Dinner'], default: ['Breakfast', 'Lunch', 'Dinner'] },
    stopped:      { type: Boolean, default: false },
    isFestival:   { type: Boolean, default: false },
    festivalName: { type: String },
    mealStatus: {
      Breakfast: { type: mealStatusSchema, default: () => ({}) },
      Lunch:     { type: mealStatusSchema, default: () => ({}) },
      Dinner:    { type: mealStatusSchema, default: () => ({}) },
    },
    priceOverrides: {
      Breakfast: { type: Number },
      Lunch:     { type: Number },
      Dinner:    { type: Number },
    },
    slotLimits: {
      Thiruvanmiyur: { Breakfast: { type: Number }, Lunch: { type: Number }, Dinner: { type: Number } },
      NLBR:          { Breakfast: { type: Number }, Lunch: { type: Number }, Dinner: { type: Number } },
    },
  },
  { timestamps: true }
);

slotDateSchema.index({ date: 1 }, { unique: true });

export default model<ISlotDate>('SlotDate', slotDateSchema);
