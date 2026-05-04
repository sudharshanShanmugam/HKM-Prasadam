import { Schema, model, Document } from 'mongoose';

export interface IMealMenu extends Document {
  date: string;
  meals: {
    Breakfast: string;
    Lunch: string;
    Dinner: string;
  };
}

const mealMenuSchema = new Schema<IMealMenu>(
  {
    date: { type: String, required: true },
    meals: {
      Breakfast: { type: String, default: '' },
      Lunch:     { type: String, default: '' },
      Dinner:    { type: String, default: '' },
    },
  },
  { timestamps: true }
);

mealMenuSchema.index({ date: 1 }, { unique: true });

export default model<IMealMenu>('MealMenu', mealMenuSchema);
