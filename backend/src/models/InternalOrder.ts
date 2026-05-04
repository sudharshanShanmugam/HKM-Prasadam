import { Schema, model, Document } from 'mongoose';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export type Department =
  | 'Temple Administration'
  | 'Deity Department'
  | 'Kitchen / Prasadam'
  | 'Education / Gurukul'
  | 'Guest House'
  | 'Security'
  | 'Accounts'
  | 'Outreach / Sankirtan'
  | 'IT / Media'
  | 'Others';

export const DEPARTMENTS: Department[] = [
  'Temple Administration', 'Deity Department', 'Kitchen / Prasadam',
  'Education / Gurukul', 'Guest House', 'Security', 'Accounts',
  'Outreach / Sankirtan', 'IT / Media', 'Others',
];

export interface IInternalOrder extends Document {
  id: string;
  name: string;
  mobile: string;
  date: string;
  dept: Department;
  meal: MealType;
  count: number;
  location: string;
  accepted: boolean;
  delivered: boolean;
  submitted?: string;
}

const internalOrderSchema = new Schema<IInternalOrder>(
  {
    id:        { type: String, unique: true },
    name:      { type: String, required: true, trim: true },
    mobile:    { type: String, required: true, match: /^\d{10}$/ },
    date:      { type: String, required: true },
    dept:      { type: String, required: true, enum: DEPARTMENTS },
    meal:      { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Dinner'] },
    count:     { type: Number, required: true, min: 1 },
    location:  { type: String, required: true, trim: true },
    accepted:  { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    submitted: { type: String },
  },
  { timestamps: true }
);

internalOrderSchema.index({ mobile: 1 });
internalOrderSchema.index({ date: 1 });
internalOrderSchema.index({ dept: 1 });
internalOrderSchema.index({ accepted: 1, delivered: 1 });

internalOrderSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = 'INT-' + String(Date.now()).slice(-4).padStart(4, '0');
  }
  if (!this.submitted) {
    this.submitted = new Date().toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }
  next();
});

export default model<IInternalOrder>('InternalOrder', internalOrderSchema);
