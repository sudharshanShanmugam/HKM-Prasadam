import { Schema, model, Document } from 'mongoose';
import { IMeals } from './PrasadamBooking';
import { nextSeq } from './Counter';

export interface IRegistration extends Document {
  id: string;
  bookingId: string;
  name: string;
  mobile: string;
  email?: string;
  location: 'Thiruvanmiyur' | 'NLBR';
  date: string;
  meals: IMeals;
  total: number;
  submitted?: string;
  approvedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    id:        { type: String, unique: true },
    bookingId: { type: String, required: true, unique: true },
    name:      { type: String, required: true, trim: true },
    mobile:    { type: String, required: true },
    email:     { type: String, trim: true },
    location:  { type: String, required: true, enum: ['Thiruvanmiyur', 'NLBR'] },
    date:      { type: String, required: true },
    meals: {
      Breakfast: { type: Number, default: 0, min: 0 },
      Lunch:     { type: Number, default: 0, min: 0 },
      Dinner:    { type: Number, default: 0, min: 0 },
    },
    total:      { type: Number, default: 0 },
    submitted:  { type: String },
    approvedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

registrationSchema.index({ mobile: 1 });
registrationSchema.index({ date: 1 });
registrationSchema.index({ bookingId: 1 });

registrationSchema.pre('save', async function () {
  if (!this.id) {
    const seq = await nextSeq('coupon');
    this.id = 'HKM-' + seq.toString().padStart(6, '0');
  }
});

export default model<IRegistration>('Registration', registrationSchema);
