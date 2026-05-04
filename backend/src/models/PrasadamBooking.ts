import { Schema, model, Document } from 'mongoose';

export interface IMeals {
  Breakfast: number;
  Lunch: number;
  Dinner: number;
}

export interface IPrasadamBooking extends Document {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  location: 'Thiruvanmiyur' | 'NLBR';
  date: string;
  meals: IMeals;
  total: number;
  status: 'pending' | 'approved' | 'declined';
  submitted?: string;
}

const prasadamBookingSchema = new Schema<IPrasadamBooking>(
  {
    id:       { type: String, unique: true },
    name:     { type: String, required: true, trim: true },
    mobile:   { type: String, required: true, match: /^\d{10}$/ },
    email:    { type: String, trim: true },
    location: { type: String, required: true, enum: ['Thiruvanmiyur', 'NLBR'] },
    date:     { type: String, required: true },
    meals: {
      Breakfast: { type: Number, default: 0, min: 0 },
      Lunch:     { type: Number, default: 0, min: 0 },
      Dinner:    { type: Number, default: 0, min: 0 },
    },
    total:     { type: Number, default: 0 },
    status:    { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    submitted: { type: String },
  },
  { timestamps: true }
);

prasadamBookingSchema.index({ mobile: 1 });
prasadamBookingSchema.index({ date: 1 });
prasadamBookingSchema.index({ status: 1 });

prasadamBookingSchema.pre('save', function (next) {
  if (!this.id)        this.id = 'HKM-' + String(Date.now()).slice(-5);
  if (!this.submitted) this.submitted = new Date().toLocaleString('en-IN');
  next();
});

export default model<IPrasadamBooking>('PrasadamBooking', prasadamBookingSchema);
