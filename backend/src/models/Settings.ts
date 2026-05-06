import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  defaultMealRates: { Breakfast: number; Lunch: number; Dinner: number };
  defaultSlotLimits: {
    Thiruvanmiyur: { Breakfast: number; Lunch: number; Dinner: number };
    NLBR:          { Breakfast: number; Lunch: number; Dinner: number };
  };
  bookingWindowOpen:  boolean;
  bookingWindowClose: boolean;
  bookingOpenDays:    number;
  bookingCloseDays:   number;
}

const settingsSchema = new Schema<ISettings>(
  {
    defaultMealRates: {
      Breakfast: { type: Number, default: 20 },
      Lunch:     { type: Number, default: 40 },
      Dinner:    { type: Number, default: 35 },
    },
    defaultSlotLimits: {
      Thiruvanmiyur: {
        Breakfast: { type: Number, default: 50 },
        Lunch:     { type: Number, default: 100 },
        Dinner:    { type: Number, default: 100 },
      },
      NLBR: {
        Breakfast: { type: Number, default: 50 },
        Lunch:     { type: Number, default: 100 },
        Dinner:    { type: Number, default: 100 },
      },
    },
    bookingWindowOpen:  { type: Boolean, default: false },
    bookingWindowClose: { type: Boolean, default: false },
    bookingOpenDays:    { type: Number, default: 7 },
    bookingCloseDays:   { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default model<ISettings>('Settings', settingsSchema);
