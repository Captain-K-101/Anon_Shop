import mongoose, { Document, Schema } from 'mongoose';

export interface IReferralCode extends Document {
  code: string;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralCodeSchema = new Schema<IReferralCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUsage: {
    type: Number,
    min: 1
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IReferralCode>('ReferralCode', referralCodeSchema); 