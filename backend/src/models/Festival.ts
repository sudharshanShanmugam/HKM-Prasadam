import { Schema, model, Document } from 'mongoose';

export interface IFestival extends Document {
  date: string;
  name: string;
  description?: string;
  icon: string;
}

const festivalSchema = new Schema<IFestival>(
  {
    date:        { type: String, required: true },
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    icon:        { type: String, default: '🙏' },
  },
  { timestamps: true }
);

festivalSchema.index({ date: 1 });

export default model<IFestival>('Festival', festivalSchema);
