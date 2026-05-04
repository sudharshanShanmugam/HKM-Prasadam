import { Schema, model, Document } from 'mongoose';
import { IMeals } from './PrasadamBooking';

export interface IPartyEnquiry extends Document {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  eventDate: string;
  address: string;
  meals: IMeals;
  preferredMenu?: string;
  preferredPrice?: number;
  confirmedMenu?: string;
  confirmedPrice?: number;
  mealPrices: IMeals;
  status: 'pending' | 'accepted' | 'declined';
  paid: boolean;
  submitted?: string;
}

const partyEnquirySchema = new Schema<IPartyEnquiry>(
  {
    id:        { type: String, unique: true },
    name:      { type: String, required: true, trim: true },
    mobile:    { type: String, required: true, match: /^\d{10}$/ },
    email:     { type: String, trim: true },
    eventDate: { type: String, required: true },
    address:   { type: String, required: true },
    meals: {
      Breakfast: { type: Number, default: 0, min: 0 },
      Lunch:     { type: Number, default: 0, min: 0 },
      Dinner:    { type: Number, default: 0, min: 0 },
    },
    preferredMenu:  { type: String, trim: true },
    preferredPrice: { type: Number, min: 0 },
    confirmedMenu:  { type: String, trim: true },
    confirmedPrice: { type: Number, min: 0 },
    mealPrices: {
      Breakfast: { type: Number, default: 0 },
      Lunch:     { type: Number, default: 0 },
      Dinner:    { type: Number, default: 0 },
    },
    status:    { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    paid:      { type: Boolean, default: false },
    submitted: { type: String },
  },
  { timestamps: true }
);

partyEnquirySchema.index({ mobile: 1 });
partyEnquirySchema.index({ eventDate: 1 });
partyEnquirySchema.index({ status: 1 });

partyEnquirySchema.pre('save', function (next) {
  if (!this.id)        this.id = 'BDY-' + String(Date.now()).slice(-5);
  if (!this.submitted) this.submitted = new Date().toLocaleString('en-IN');
  next();
});

export default model<IPartyEnquiry>('PartyEnquiry', partyEnquirySchema);
