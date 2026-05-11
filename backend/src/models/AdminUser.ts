import { Schema, model, Document } from 'mongoose';

export interface IAdminUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin' | 'kitchen_manager' | 'accounts_manager' | 'gita_counter' | 'prasadam_hall';
  createdAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['superadmin', 'admin', 'kitchen_manager', 'accounts_manager', 'gita_counter', 'prasadam_hall'], default: 'admin' },
  },
  { timestamps: true }
);

export default model<IAdminUser>('AdminUser', adminUserSchema);
